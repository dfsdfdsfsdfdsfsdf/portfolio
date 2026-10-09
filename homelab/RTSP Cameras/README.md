Idea: To setup 3 household cameras that would be accessable from anywhere in the world without exposing the cameras to the internet

Equipment: Homeserver, Raspberry Pi Zero 2w, 3 tapo IP cameras


Initial Setup:

Initially my plan for these cameras was the following

Cameras -> tailnet -> Home sever -> tailnet -> VLC Client

Problem 1:After connecting the cameras to the WIFI and setting up a camera account, RTSP was not showing as an option on the tapo app, looking online it showed that there was a block in the app for some lower end camera models.

Inorder to see whether this was an app issue or a true camera limitation I ran a quick nmap scan on all three of the cameras ip addresses toward port 554 too see if the port was open.

Once I saw the rtsp port was open, I went onto my VLC Client while on the same LAN as the cameras and managed to get a working stream through rtsp://<username>:<password>@<camera-ip>:554.

Now I had another barrier in the way, while the camera were streaming on the LAN, I now had to work out how I was going to get these cameras to connect to my server (which is not on the LAN) without exposing the camera online.

After a bit of research online I decided to connect my Pi zero 2w to the cameras and use it as a relay to my tailnet where the server could connect to it from.

New Setup idea:

Cameras -> LAN -> Pi -> tailnet -> server -> tailnet -> VLC client

I used a docker container with MediaMTX installed on the Pi to login to the cameras stream through the lan and assigned each camera its own sub route so the server could grab the stream from the pi like this:

rtsp://PI tailscale ip:554/camera1
rtsp://PI tailscale ip:554/camera2
rtsp://PI tailscale ip:554/camera3

The reason I decided to only have the server grab the PIs streams then restream them to the vlc clients was due to the limited power (namely the lack of ram) of the pi, while this did introduce some latency it prevents dropped frames and keeps the stream stable regardless of how many other devices are watching the main servers stream.

So now the VLC clients connect too

rtsp://Server tailscale ip:554/camera1
rtsp://Server tailscale ip:554/camera2
rtsp://Server tailscale ip:554/camera3

Also since this is being routed through my main server this leaves me with some room to take advantage of services like frigate and pytapo if needed.
