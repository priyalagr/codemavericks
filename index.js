let appID = "25927244ebd91a11";
let region = "IN";
let authKey = "83b1300c32d9a0dac101f8559cea200053e25760";

let appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .autoEstablishSocketConnection(true)
  .build();

CometChat.init(appID, appSetting).then(
  () => {
    console.log("Initialization completed successfully");
  },
  (error) => {
    console.log("Initialization failed with error:", error);
  }
);

function logout() {
  CometChat.logout().then(
    () => {
      console.log("Logout completed successfully");
      document.getElementById('login-prompt').style.display = "block";
      document.getElementById('chat-window').style.display = "none";
      removeMsgListener();
    }, error => {
      console.log("Logout failed with exception", { error });
    }
  );
}

function createUser() {
    let txtuser = document.getElementById('txtuser').value;
    let groupID = document.getElementById('group-id').value; // Get the group ID from the input field
    console.log('username', txtuser);
  
    var UID = txtuser;
    var name = txtuser;
  
    var user = new CometChat.User(UID);
    user.setName(name);
  
    CometChat.createUser(user, authKey).then(
      user => {
        loguserIn(user, authKey, UID, groupID);
      }, error => {
        console.log("Error creating user", error);
        if (error.code == "ERR_UID_ALREADY_EXISTS") {
          loguserIn(user, authKey, UID, groupID);
        } else if (error.code == "ERR_PLAN_QUOTA_RESTRICTION") {
          showAlert("You've exhausted the quota. Please upgrade your plan to continue.");
          // You can add additional handling here, such as disabling the form or showing an error message.
        } else {
          showAlert("Error creating user: " + error.message);
        }
      }
    );
  }
  
  function showAlert(message) {
    var alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.textContent = message;
    document.body.appendChild(alertElement);
  
    setTimeout(function() {
      alertElement.remove();
    }, 5000); // Remove the alert after 5 seconds
  }
  
  function loguserIn(user, authKey, UID, groupID) {
    CometChat.login(UID, authKey).then(
      user => {
        console.log("Login Successful:", { user });
        document.getElementById('login-prompt').style.display = "none";
        document.getElementById('chat-window').style.display = "block";
        document.getElementById('your-username').innerHTML = user.name;
        document.getElementById('current-group-id').innerHTML = groupID; // Display the group ID
        createMsgListener();
        checkOrCreateGroup(groupID); // Check if the group exists or create it
      }, error => {
        console.log("Login failed with exception", { error });
      }
    );
  }
  
  function checkOrCreateGroup(GUID) {
    CometChat.getGroup(GUID).then(
      group => {
        console.log("Group exists:", group);
        joinGroup(GUID);
      }, error => {
        if (error.code === "ERR_GUID_NOT_FOUND") {
          createGroup(GUID);
        } else {
          console.log("Group check failed with exception:", error);
        }
      }
    );
  }
  
  function createGroup(GUID) {
    var groupType = CometChat.GROUP_TYPE.PUBLIC;
    var password = "";
    var group = new CometChat.Group(GUID, GUID, groupType, password);
  
    CometChat.createGroup(group).then(
      group => {
        console.log("Group created successfully:", group);
        joinGroup(GUID);
      }, error => {
        console.log("Group creation failed with exception:", error);
      }
    );
  }
  
  function joinGroup(GUID) {
    var password = "";
    var groupType = CometChat.GROUP_TYPE.PUBLIC;
  
    CometChat.joinGroup(GUID, groupType, password).then(
      group => {
        console.log("Group joined successfully", group);
      }, error => {
        console.log("Group joining failed with exception", error);
      }
    );
  }
  
  function createMsgListener() {
    let listenerID = "GLOBAL_LISTENER_ID";
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: textMessage => {
          displayMessage(textMessage);
          console.log("Text message received successfully", textMessage);
        },
        onMediaMessageReceived: mediaMessage => {
          console.log("Media message received successfully", mediaMessage);
        },
        onCustomMessageReceived: customMessage => {
          console.log("Custom message received successfully", customMessage);
        }
      })
    );
  }
  
  function displayMessage(message) {
    let messageContainer = document.getElementById('messages');
    let messageElement = document.createElement('div');
    
    if (message.sender.uid === CometChat.getLoggedInUser().uid) {
      messageElement.className = 'message right'; // Align to the right for the sender's own messages
    } else {
      messageElement.className = 'message left'; // Align to the left for other participants' messages
    }
    
    messageElement.innerHTML = `<span class="sender">${message.sender.name}:</span> ${message.text}`;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom of the chat box
  }
  
  function removeMsgListener() {
    let listenerID = "GLOBAL_LISTENER_ID";
    CometChat.removeMessageListener(listenerID);
  }
  
  function sendMessage() {
    let receiverID = document.getElementById('group-id').value; // Use the group ID from the input field
    let messageText = document.getElementById('message').value;
    let receiverType = CometChat.RECEIVER_TYPE.GROUP;
    let textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);
    
    CometChat.sendMessage(textMessage).then(
      message => {
        console.log("Message sent successfully", message);
        displayMessage(message); // Display the sent message
        document.getElementById('message').value = ''; // Clear the message input field
      }, error => {
        console.log("Message sending failed with error:", error);
      }
    );
  }
  