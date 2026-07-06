# Use the official and widely-used Minecraft server image
FROM itzg/minecraft-server

# Set environment variables so the container runs as a Paper 1.12.2 server
ENV EULA=TRUE \
    TYPE=PAPER \
    VERSION=1.12.2

# Copy your local plugins directory into the container's data folder
# Note: Ensure your 'plugins' folder is in the same directory as this Dockerfile
COPY --chown=minecraft:minecraft ./plugins /data/plugins
