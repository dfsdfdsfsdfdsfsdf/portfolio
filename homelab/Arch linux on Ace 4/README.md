# Arch Linux on Android (Samsung Galaxy Ace 4)

## Overview

This project was a personal experiment to see whether I could run Arch Linux on an old Android phone I had lying around.  
The goal wasn’t daily usability, but exploration, learning, and understanding how far a constrained device could be pushed.

The setup uses a chrooted Arch Linux filesystem running on top of Android after rooting the device.

---

## Device

- **Model:** Samsung Galaxy Ace 4  
- **Architecture:** ARM (armv7l)

---

## High-Level Process

Below is a high-level overview of how the setup was achieved:

Enable developer mode  
→ Unlock bootloader  
→ Flash TWRP recovery  
→ Root device via SuperSU  
→ Install Android terminal (via F-Droid)  
→ Copy Arch Linux filesystem to device  
→ Chroot into Arch environment  

---

## Preparing the Device

To prepare the device, developer mode was enabled by navigating to:

`Settings → About → Tap Build Number until Developer Mode is enabled`

Once enabled:
- USB debugging was turned on
- OEM unlocking was enabled

The device was then connected to a laptop and verified using:

adb devices
The connection request was confirmed on the phone.
Flashing TWRP Recovery
The correct TWRP recovery image for the Samsung Galaxy Ace 4 was downloaded.

#The phone was rebooted into fastboot mode using:


adb reboot fastboot
With the device still connected, TWRP was flashed using:

fastboot flash recovery <twrp-image>.img
Rooting the Device
After flashing recovery, the device was booted into TWRP by holding:
Volume Down + Power
Once inside TWRP, the SuperSU ZIP was pushed to the device:
adb push <supersu.zip> /sdcard
The ZIP was then installed via TWRP to gain root access.

#Installing Arch Linux

After rebooting and confirming root access:
The correct Arch Linux ARM filesystem (armv7l) was downloaded
F-Droid and an Android terminal app were installed
The Arch filesystem was copied into the root directory on the device under /arch
Chrooting into Arch
With the filesystem in place, the final step was entering the Arch environment.

From a terminal session:

chroot /arch /arch/bin/bash
At this point, the device was running a functional Arch Linux environment within Android.

#Notes

This was done primarily for experimentation and learning
Performance is limited due to hardware constraints
The project helped reinforce understanding of bootloaders, recovery images, rooting, Linux filesystems, and chroot environments
This setup is not intended for production use, but as a technical exploration.
