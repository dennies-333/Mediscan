import './style.css';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initModules();
  initChatbot();
});

// Initialize disease detection modules
function initModules() {
  // Handle file uploads
  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach(input => {
    input.addEventListener('change', handleFileUpload);
  });

  // Handle analyze buttons
  const analyzeButtons = document.querySelectorAll('.analyze-btn');
  analyzeButtons.forEach(button => {
    button.addEventListener('click', handleAnalysis);
  });
}

// Handle file uploads
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const moduleId = event.target.id.split('-')[0];
  const resultArea = document.getElementById(`${moduleId}-result`);
  
  // Clear previous results
  resultArea.innerHTML = '';
  resultArea.style.display = 'none';
  
  // Remove previous preview if exists
  const existingPreview = document.querySelector(`.upload-section .image-preview`);
  if (existingPreview) {
    existingPreview.remove();
  }
  
  // Create and display image preview
  const reader = new FileReader();
  reader.onload = function(e) {
    const preview = document.createElement('img');
    preview.src = e.target.result;
    preview.alt = 'Uploaded image';
    preview.className = 'image-preview';
    
    const uploadArea = document.querySelector(`.upload-area`);
    uploadArea.parentNode.insertBefore(preview, uploadArea.nextSibling);
  };
  reader.readAsDataURL(file);
}

// Handle analysis button clicks
function handleAnalysis(event) {
  const moduleType = event.target.dataset.module;
  const resultArea = document.getElementById(`${moduleType}-result`);
  const fileInput = document.getElementById(`${moduleType}-upload`);
  
  // Check if file is uploaded
  if (!fileInput.files[0]) {
    resultArea.innerHTML = '<p style="color: #ff5555;">Please upload an image first.</p>';
    resultArea.style.display = 'block';
    return;
  }
  
  // Show loading state
  resultArea.innerHTML = '<div class="loading"></div> Analyzing image...';
  resultArea.style.display = 'block';
  
  // Simulate analysis (in a real app, this would call an API)
  setTimeout(() => {
    const results = generateMockResults(moduleType);
    displayResults(moduleType, results);
  }, 2000);
}

// Generate mock results for demonstration
function generateMockResults(moduleType) {
  const results = {
    cataract: {
      condition: 'Early Stage Cataract',
      probability: 0.78,
      recommendations: [
        'Schedule an appointment with an ophthalmologist',
        'Avoid driving at night if experiencing glare',
        'Consider prescription glasses for improved vision'
      ]
    },
    skin: {
      condition: 'Benign Skin Lesion',
      probability: 0.92,
      recommendations: [
        'Monitor for changes in size, color, or shape',
        'Apply sunscreen regularly',
        'Follow up with a dermatologist if concerned'
      ]
    },
    lung: {
      condition: 'Possible Pneumonia',
      probability: 0.65,
      recommendations: [
        'Consult with a pulmonologist',
        'Complete a full respiratory assessment',
        'Consider additional diagnostic tests'
      ]
    },
    bone: {
      condition: 'Minor Hairline Fracture',
      probability: 0.83,
      recommendations: [
        'Rest and immobilize the affected area',
        'Apply ice to reduce swelling',
        'Schedule an orthopedic consultation'
      ]
    }
  };
  
  return results[moduleType];
}

// Display analysis results
function displayResults(moduleType, results) {
  const resultArea = document.getElementById(`${moduleType}-result`);
  const probabilityPercentage = Math.round(results.probability * 100);
  
  let resultHTML = `
    <h3>Analysis Results</h3>
    <p><strong>Detected Condition:</strong> ${results.condition}</p>
    <p><strong>Confidence:</strong> ${probabilityPercentage}%</p>
    <div class="confidence-bar">
      <div class="confidence-level" style="width: ${probabilityPercentage}%"></div>
    </div>
    <h4>Recommendations:</h4>
    <ul>
  `;
  
  results.recommendations.forEach(rec => {
    resultHTML += `<li>${rec}</li>`;
  });
  
  resultHTML += `
    </ul>
    <p class="disclaimer">Note: This is a preliminary analysis and should not replace professional medical advice.</p>
    <button class="download-btn">Download Report</button>
  `;
  
  resultArea.innerHTML = resultHTML;
  
  // Add event listener to download button
  const downloadBtn = resultArea.querySelector('.download-btn');
  downloadBtn.addEventListener('click', () => {
    alert('Report download functionality would be implemented in a production environment.');
  });
}

// Initialize chatbot functionality
function initChatbot() {
  const chatToggle = document.querySelector('.chatbot-toggle');
  const chatWindow = document.querySelector('.chatbot-window');
  const closeChat = document.querySelector('.close-chat');
  const sendButton = document.getElementById('send-message');
  const chatInput = document.getElementById('chat-input');
  const messagesContainer = document.querySelector('.chatbot-messages');
  
  // Toggle chatbot window
  chatToggle.addEventListener('click', () => {
    chatWindow.classList.add('active');
    chatWindow.style.display = 'flex';
  });
  
  // Close chatbot window
  closeChat.addEventListener('click', () => {
    chatWindow.classList.remove('active');
    setTimeout(() => {
      chatWindow.style.display = 'none';
    }, 300);
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
  function sendMessage() {
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
    
    // Simulate bot response after delay
    setTimeout(() => {
      messagesContainer.removeChild(typingIndicator);
      const botResponse = getBotResponse(message);
      addMessage(botResponse, 'bot');
    }, 1500);
  }
  
  // Add message to chat
  function addMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `<div class="message-content">${message}</div>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Get bot response based on user input
  function getBotResponse(message) {
    message = message.toLowerCase();
    
    // Get current page to provide context-specific responses
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! How can I assist you with your health concerns today?';
    } else if (message.includes('cataract')) {
      return 'Cataracts are cloudy areas in the lens of the eye that can cause blurry vision. Our cataract detection module can help identify potential issues. Would you like to know more about cataracts or how to use our detection tool?';
    } else if (message.includes('skin') || message.includes('rash') || message.includes('mole')) {
      return 'Our skin disease detection module can help identify various skin conditions including potential melanoma, eczema, and psoriasis. Upload a clear image of the affected area for analysis.';
    } else if (message.includes('lung') || message.includes('tuberculosis') || message.includes('pneumonia') || message.includes('breathing')) {
      return 'Respiratory conditions like tuberculosis and pneumonia can be detected through chest X-rays. Our lung disease module analyzes these images to identify potential issues. Always consult with a healthcare provider for proper diagnosis.';
    } else if (message.includes('bone') || message.includes('fracture') || message.includes('arthritis') || message.includes('joint')) {
      return 'Our bone condition analysis can help detect fractures, arthritis, and other skeletal issues. For best results, upload a clear X-ray image of the affected area.';
    } else if (message.includes('how') && message.includes('work')) {
      return 'Our disease detection system uses advanced AI algorithms to analyze medical images. Simply upload an image to the appropriate module, click "Analyze," and receive preliminary results. Remember, these results should be reviewed by a healthcare professional.';
    } else if (message.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    } else if (message.includes('doctor') || message.includes('appointment')) {
      return 'While our tool can provide preliminary analysis, it\'s important to consult with a healthcare professional for proper diagnosis and treatment. Would you like information on finding a specialist?';
    } else if (message.includes('upload') || message.includes('image')) {
      return 'To upload an image, click on the upload area above or drag and drop your image file. Make sure the image is clear and well-lit for the best analysis results.';
    } else if (message.includes('accurate') || message.includes('accuracy')) {
      return 'Our AI models have been trained on thousands of medical images, but no system is 100% accurate. Always consult with a healthcare professional for a definitive diagnosis.';
    } else if (currentPage === 'cataract') {
      return 'For cataract detection, we recommend uploading a clear, well-lit image of the eye. Early detection of cataracts can lead to more effective treatment options. Is there something specific about cataracts you\'d like to know?';
    } else if (currentPage === 'skin') {
      return 'For skin disease detection, please ensure your image shows the affected area clearly. Different lighting conditions can affect the analysis, so natural lighting is best. Do you have any specific questions about skin conditions?';
    } else if (currentPage === 'lung') {
      return 'Our lung disease detection works best with standard chest X-ray images. The AI can detect patterns associated with tuberculosis, pneumonia, and other respiratory conditions. Would you like more information about these conditions?';
    } else if (currentPage === 'bone') {
      return 'For bone condition analysis, please upload a clear X-ray of the affected area. Our system can detect fractures, signs of arthritis, and other bone abnormalities. Is there a specific bone condition you\'re concerned about?';
    } else {
      return 'I\'m here to help with questions about our disease detection modules. You can ask about cataracts, skin diseases, lung conditions, or bone/joint issues. How can I assist you today?';
    }
  }
}