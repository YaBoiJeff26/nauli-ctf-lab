#!/bin/bash
echo "[+] Starting Proxmox VM Setup..."

sudo useradd -m -s /bin/bash analyst
echo "analyst:blue_team_rocks" | sudo chpasswd

sudo sed -i 's/^#Port 22/Port 2275/' /etc/ssh/sshd_config
sudo sed -i 's/^Port 22/Port 2275/' /etc/ssh/sshd_config
sudo systemctl restart ssh

bash ./generate_logs.sh

echo "[+] Setup Complete! SSH is now on port 2275."
