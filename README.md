# Notes Web App

Yet another notes app made for learning purposes, this is my first crack at a full-blown fullstack web application that uses TypeScript and runs a backend server app using Express.js/Node.js and ReactJS on the front.

To use this on your local machine you'll need to sign up on Atlas' MongoDB and acquire an API key for your database and place it in .env, you'll also need to define a random port number and a random secret key for the cookies session encryption inside .env as well.


I have also deployed the server, set up firewalls (ufw), enforced several security measures such as disabling unused ports, disabled root and password access, set up pm2 for auto-restarting and management, set up Nginx proxy server, and set up an SSL certificate on a remotely hosted server for demonstration purposes, while the remote server remains online for the time being.

Both the frontend and backend for his project are live at:
https://mhmd-noteswebapp.com/

I may stop running this server because keeping the server up and renewing the domain costs money and this was all set up for learning and demonstration purposes.

In such cases, download and run this code the code, set the proper .env variables and run this at:
http://localhost:PORT

