BookStack Knowledge Base — Homelab Deployment
-
Self-hosted BookStack instance used as a central documentation platform for my home lab, projects, and technical notes.

This repository documents the purpose, architecture, and operational considerations of the deployment rather than acting as a full installation guide.

---

Why This Exists
-
As my homelab and personal projects grew along with my increase in studying for certifications, I needed a single, structured source of truth for documentation.  
Scattered notes and cloud-based tools didn’t reflect how documentation is handled in real IT environments.

BookStack was chosen to:
- Centralise technical knowledge
- Encourage consistent documentation habits
- Mirror documentation practices used in professional IT teams

This setup is actively used, not a one-off experiment.
-
---

What It’s Used For
-
- Documenting homelab services and architecture
- Recording troubleshooting steps and fixes
- Maintaining personal study notes and learning material
- Acting as a searchable knowledge base across devices

---

Architecture Overview
-

- **Application:** BookStack
- **Database:** MariaDB
- **Deployment:** Docker containers
- **Host OS:** ubuntu server
- **Access:** Restricted to private network via VPN

High-level flow
-
User -> VPN -> BookStack -> Database

The service is intentionally not exposed publicly.

---

Deployment Summary
-
- Deployed using Docker Compose
- Environment variables stored outside version control
- Containers configured for automatic restart
- Service tested locally before VPN access was enabled
- Updates applied as part of regular system maintenance

Sensitive configuration details (credentials, tokens, IPs) are intentionally excluded from this repository.

---

Security Considerations
-
- No public internet exposure
- Access restricted via private VPN

Security decisions prioritise practicality and risk reduction over unnecessary complexity.

---

Skills Demonstrated
-
- Self-hosting and service deployment
- Docker container management
- Linux system administration
- Documentation best practices
- Access control and basic service security

---

Screenshots
-
Screenshots are included to show real usage and structure:
- BookStack dashboard
- Example bookshelf and page layout

---

Future Improvements
-
- More structured documentation templates
- Automated backup verification
- Improved tagging and cross-linking of content

---

## Notes

This repository focuses on *why* and *how* the system is used rather than providing a step-by-step guide.  
I’m always happy to walk through design decisions, trade-offs, and lessons learned during discussion or interview.
