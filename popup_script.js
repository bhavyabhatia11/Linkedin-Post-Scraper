const inputField = document.getElementById('inputField');
const submitButton = document.getElementById('submitButton');
const loadingState = document.getElementById('loadingState');
const content = document.getElementById('content');

    // Add an event listener to the submit button
    submitButton.addEventListener('click', function() {
      if(inputField.value <= 0){
        alert("Please enter a valid number! (1 to 200) ");
        return;
      }

      if(inputField.value > 200){
        alert("Max limit is 200!");
        return;
      }
      // When the button is clicked, show the loading state and hide the input field and submit button
      loadingState.style.display = 'block';
      content.style.display = 'none';
      

      chrome.runtime.sendMessage({
        value: inputField.value
      });
      // Simulate a long-running operation (e.g., a file download)
    });

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      if (message.type === "download_complete") {
        // Do something when download is complete
        console.log('this is working');
        loadingState.style.display = 'none';
        content.style.display = 'block';
      }
    });