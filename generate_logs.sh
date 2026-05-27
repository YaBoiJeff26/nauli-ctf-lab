#!/bin/bash

sudo mkdir -p /opt/admin/logs

echo "2026/05/27 18:50:15 [error] 1337#0: *1 [WAF] Blocked payload containing <script> from client: 10.10.14.50" | sudo tee /opt/admin/logs/error.log > /dev/null

echo "2026/05/27 18:53:10 [CRITICAL] 1337#0: *2 Authentication bypass anomaly detected: session token reuse from client 10.10.14.50" | sudo tee -a /opt/admin/logs/error.log > /dev/null

echo '192.168.1.100 - - [27/May/2026:18:40:00 +0000] "GET /dashboard HTTP/1.1" 200 1204 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "-"' | sudo tee /opt/admin/logs/access.log > /dev/null

echo '10.10.14.50 - - [27/May/2026:18:51:55 +0000] "GET /dashboard HTTP/1.1" 200 2408 "-" "Mozilla/5.0" "UEhBT1RPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0}"' | sudo tee -a /opt/admin/logs/access.log > /dev/null

echo "[+] Mock logs successfully generated in /opt/admin/logs/"
