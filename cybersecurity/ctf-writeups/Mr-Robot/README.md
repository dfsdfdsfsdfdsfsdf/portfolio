

9 Oct 2026

## Executive Summary

This engagement achieved full root compromise of the target host (192.168.56.104) through a five stage attack chain: username enumeration, a dictionary based credential attack, authenticated remote code execution via WordPress, exploitation of an outdated kernel environment, and local privilege escalation through an insecure SUID binary.

Overall risk: Critical. An attacker with no prior credentials and only public wordlists could reach a root shell on this host starting from a web browser alone.

## Scope and Target

Target: 192.168.56.104, an internal isolated test network.

Objective: identify and exploit vulnerabilities to establish a foothold, escalate to root, and document each step with command, evidence, and impact.

Testing was black box. No credentials or source access were provided in advance.

## Methodology

1. Reconnaissance: host discovery and full port scan
2. Enumeration: service fingerprinting, directory discovery, and manual site walkthrough
3. Vulnerability analysis: reviewing discovered attack surface for exploitable weaknesses
4. Exploitation: credential attack and authenticated code execution
5. Post exploitation: privilege escalation to root and flag retrieval

## Findings

|   |   |   |
|---|---|---|
|#|Finding|Severity|
|1|WordPress username enumeration|Medium|
|2|Weak, dictionary crackable password|High|
|3|Sensitive files exposed via directory discovery|High|
|4|Outdated, unpatched kernel|Critical|
|5|Insecure SUID binary (nmap) allowing root escalation|Critical|

## Finding 1: WordPress Username Enumeration (Medium)

The WordPress login form at /wp-login.php returns a different error message depending on whether a submitted username exists. Submitting the username "Elliot" with a random password returned:

"The password you entered for the username Elliot is incorrect."

This confirmed a valid username without needing a correct password, narrowing the credential attack to a single account rather than a full username and password combination search.

## Finding 2: Weak, Dictionary Crackable Password (High)

Using the confirmed username "Elliot" and a deduplicated copy of a dictionary file discovered on the site (fsocity.dic), a brute force attack was run against the login form with Hydra:

```
hydra -l Elliot -P fsocity_dedup.txt 192.168.56.104 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^:F=login_error" -I -V -f
```

A valid password was recovered within the attack window: ER28-0652. The account had administrator privileges, allowing direct code execution through the WordPress theme or plugin editor.

A second password was later recovered for the "robot" account by copying an otherwise unreadable password hash file to a writable location, then cracking it offline:

```
hashcat -m 0 -a 0 hash.txt rockyou.txt
```

Result: abcdefghijklmnopqrstuvwxyz, a hash commonly found in public rainbow tables and wordlists rather than a unique credential.

## Finding 3: Sensitive Files Exposed via Directory Discovery (High)

A gobuster scan against the webroot surfaced several files that should not be reachable by an unauthenticated visitor, including robots.txt, which directly listed two paths:

```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

fsocity.dic is a large dictionary file later reused in the credential attack described in Finding 2. key-1-of-3.txt contained a flag, demonstrating that sensitive application artifacts were reachable with no authentication at all, directly from a hint in robots.txt.

## Finding 4: Outdated, Unpatched Kernel (Critical)

After gaining a low privilege web shell, `uname -a` showed a kernel from mid 2015:

```
Linux linux 3.13.0-55-generic #94-Ubuntu SMP Thu Jun 18 00:27:10 UTC 2015 x86_64
```

A kernel this old carries multiple public local privilege escalation vulnerabilities. CVE-2015-1328 (an overlayfs permission check flaw) was identified and attempted first, since it matched the kernel version closely. This path did not succeed; a prior partial run had left root owned files behind that the low privilege user could not clean up, blocking a clean retry. This was investigated and ruled out before moving to Finding 5, which proved to be the actual path to root.

The underlying issue remains the same regardless of which specific kernel exploit eventually works: an 11 year old unpatched kernel is a standing invitation for local privilege escalation.

## Finding 5: Insecure SUID Binary, nmap (Critical)

The installed nmap binary was version 3.81, a release old enough to still include an interactive mode that was later removed specifically because of this class of issue. Checking its permissions showed:

```
-rwsr-xr-x 1 root root 504736 Nov 13 2015 /usr/local/bin/nmap
```

The `s` in the permission string means nmap runs as its owner, root, regardless of who invokes it. Combined with the old interactive mode, this allowed a direct shell escape running with root privileges:

```
nmap --interactive
!sh
whoami
```

Output: root. This single misconfiguration (an unnecessary SUID bit on an unnecessary, outdated binary) converted a standard user account into full root access, and was the actual path used to compromise the host.

## Attack Chain Narrative

1. Directory discovery and robots.txt exposed a dictionary file and a flag with no authentication required.
2. The WordPress login form's error messages confirmed the username Elliot.
3. A dictionary attack with Hydra recovered Elliot's password, granting administrator access to the WordPress site.
4. Editing a theme file to include a reverse shell payload granted remote code execution as a low privilege daemon user.
5. A password hash unreadable directly was copied to a writable directory, read there, and cracked offline to recover the robot account's password.
6. nmap, running with the SUID bit set and old enough to retain an interactive mode, was used to escape directly to a root shell.

Each step on its own is a known, well documented weakness. Chained together, they take an anonymous web visitor to full root in a single session.

## Recommendations

|   |   |   |
|---|---|---|
|Finding|Immediate action|Longer term action|
|1. Username enumeration|Return a generic error message for both unknown usernames and wrong passwords|Add rate limiting and account lockout to the login endpoint|
|2. Weak password|Force a password reset for all accounts; enforce a strong password policy|Check new passwords against known breached and common password lists at creation time|
|3. Exposed sensitive files|Remove dictionaries, hashes, and flags from the webroot; stop listing sensitive paths in robots.txt|Add automated scanning for sensitive files exposed under the webroot|
|4. Outdated kernel|Patch the kernel to a current, supported version|Put the host on a regular patching schedule tied to vendor security advisories|
|5. Insecure SUID nmap|Remove the SUID bit from nmap, or remove nmap entirely if not required on this host|Audit all SUID binaries system wide on a recurring basis with `find / -perm -4000`|

## Conclusion

The compromise did not depend on any single advanced technique. Each finding on its own is a common, well understood weakness, and together they formed a complete path from an anonymous visitor to root. Remediation of Finding 5 alone (the SUID nmap binary) would have stopped the actual path used in this engagement, but Findings 1 through 4 remain real weaknesses in their own right and should be remediated regardless of which single fix closes the immediate path to root.
