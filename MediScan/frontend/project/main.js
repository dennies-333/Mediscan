
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

// Initialize chatbot functionality
function initChatbot() {
  console.log("aclled");
  const chatToggle = document.querySelector('.chatbot-toggle');
  const chatWindow = document.querySelector('.chatbot-window');
  const closeChat = document.querySelector('.close-chat');
  const sendButton = document.getElementById('send-message');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.querySelector('.chatbot-messages');
  
  // Toggle chatbot window
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('active');
  });
  
  closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
  });
  
  
  // Send message on button click
  sendButton.addEventListener('click', sendMessage);
  
  // Send message on Enter key
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Function to send user message and get bot response
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot';
    typingIndicator.innerHTML = '<div class="message-content"><div class="loading"></div> Typing...</div>';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
      // Wait for bot response
      const botResponse = await getBotResponse(message);
      messagesContainer.removeChild(typingIndicator);
      addMessage(botResponse, 'bot');
    } catch (error) {
      messagesContainer.removeChild(typingIndicator);
      addMessage('Error: Unable to get response.', 'bot');
      console.error('API error:', error);
    }
  }

  
  // Add message to chat
  function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `<div class="message-content">${message}</div>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  

  async function getBotResponse(message) {
    try {
      const response = await fetch("http://192.168.1.38:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return formatMarkdown(data.response) || "Sorry, I didn't get that.";
    } catch (error) {
      console.error('Error fetching bot response:', error);
      return "I'm having trouble responding right now.";
    }
  }
  

  function formatMarkdown(text) {
    // Convert **bold** text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');

    // Convert lists (* and -)
    text = text.replace(/(\*|-)\s(.*?)(\n|$)/g, '<li>$2</li>');
    text = text.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

    return text;
}

const newChatButton = document.getElementById('new-chat');

newChatButton.addEventListener('click', async () => {
  try {
    // Call the reset API
    const response = await fetch("http://192.168.1.38:5000/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error('Failed to reset the chat.');
    }

    // Clear chat messages and input field
    messagesContainer.innerHTML = '';
    chatInput.value = '';

    // Add bot's welcome message
    addMessage("Hello! I'm MediBot, your medical assistant. How can I help you today?", 'bot');
  } catch (error) {
    console.error('Error resetting chat:', error);
    addMessage("Oops! Something went wrong while starting a new chat.", 'bot');
  }
});



}



// Get DOM elements
const cataractUpload = document.getElementById('cataract-upload');
const analyzeButton = document.querySelector('.analyze-btn[data-module="cataract"]');
const resultArea = document.getElementById('cataract-result');

// Image preview and validation
cataractUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    resultArea.innerHTML = `
      <p><strong>Image Preview:</strong></p>
      <img src="${URL.createObjectURL(file)}" alt="Uploaded eye image" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">
    `;
  } else {
    resultArea.innerHTML = '<p style="color: red;">Please upload a valid image file.</p>';
    cataractUpload.value = ''; // Reset file input
  }
});

// Simulated AI analysis logic
analyzeButton.addEventListener('click', () => {
  if (!cataractUpload.files.length) {
    resultArea.innerHTML = '<p style="color: red;">Please upload an image first.</p>';
    return;
  }

  resultArea.innerHTML += '<p>Analyzing image... ⏳</p>';

  // Simulate processing time (e.g., pretend we're calling an AI model)
  setTimeout(() => {
    const randomResult = Math.random() > 0.5 ? 'Cataract detected! ❗' : 'No signs of cataract detected. ✅';
    resultArea.innerHTML += `<p><strong>Result:</strong> ${randomResult}</p>`;
  }, 2000); // 2-second "processing" delay
});
