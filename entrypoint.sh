#!/bin/bash
set -e

# # Start SSH server
service ssh start

# Start pm2-runtime
pm2-runtime start ecosystem.config.cjs

#
