# Connect-One-On-One

Welcome to Connect-One-On-One! This video calling app leverages the Agora Real-Time Messaging SDK to facilitate seamless and high-quality video communication. Users can create or join rooms by simply entering a room name, enabling one-on-one video calls with ease.

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Technologies Used](#technologies-used)

## Features

-   High-quality video calls using Agora Real-Time Messaging SDK
-   Simple room creation and joining by entering a room name
-   Real-time messaging for smooth communication
-   User-friendly interface

## Installation

Follow these steps to get the project up and running on your local machine:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/VivekChaurasia03/Connect-One-On-One.git
    cd Connect-One-On-One
    ```

2. **Add your Agora App ID:**
   Open `main.js` and ensure the Agora App ID is set:

    ```javascript
    let APP_ID = "YOUR_AGORA_APP_ID";
    ```

3. **Run the app using live-server:**
   Install `live-server` globally if you haven't already:

    ```bash
    npm install -g live-server
    ```

    Serve the project directory:

    ```bash
    live-server
    ```

    The app should now be running at `http://localhost:8080`.

## Usage

1. **Open the App:**
   Navigate to `http://localhost:8080`.

2. **Enter Room Name:**
   On the home page, enter the name of the room you want to join. Make sure the other user is aware of the room name.

3. **Join Room:**
   Click the "Join" button to enter the room. If another user joins the same room, you'll be connected via video call. If a different room name is entered, a new room will be created.

## Technologies Used

-   Agora Real-Time Messaging SDK
-   HTML/CSS/JavaScript
