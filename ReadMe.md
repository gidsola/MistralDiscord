# MistralDiscord

MistralDiscord is a Discord AI solution that leverages MistralAI Api to provide intelligent interactions within Discord. This repository contains the necessary setup and instructions to get your MistralDiscord instance up and running.

## Requirements

- NodeJS
- Docker
- Weaviate
- MistralAI API key
- Discord bot token

## Initial Setup

1. Clone the repository:
   
git clone https://github.com/yourusername/MistralDiscord.git
cd MistralDiscord
   
2. Install the necessary dependencies:
   
npm install
   
## Running the Software

The `npm start` command will perform the following actions:
 - Download a NodeJS version 23 image consisting of 8 layers.
 - Build a "core" image used for the Discord connection.
 - Create a Docker container using a Binds mount.


I hope this will allow folks a chance to play with Ai when they could not before.

All the above requirements can be obtained for free by visiting the associated website.

Happy Clickin :)