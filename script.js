const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBody = document.getElementById("chatBody");
const themeToggle = document.getElementById("themeToggle");

let _config = {
  openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
  openAI_model: "gpt-4o-mini",
  ai_instruction: `You are a helpful and friendly JavaScript tutor.
  You will ONLY answer questions related to JavaScript programming — such as syntax, DOM manipulation, arrays, loops, functions, ES6, debugging, and logical concepts.

  If the question is NOT about JavaScript, respond with:
  "<p> Sorry, I only teach JavaScript! Please ask me something related to JS. </p>"

  When answering, explain clearly and step-by-step if needed.
  Use simple HTML formatting (<p>, <b>, <ul>, <code>) for structure.
  Always output in HTML format.`,
  response_id: "",
};

// 🧠 Load optional JSON config (if you want to override values dynamically)
fetch("config.json")
  .then((res) => res.json())
  .then((data) => {
    _config = { ..._config, ...data };
    console.log("Config loaded:", _config);
  })
  .catch((err) => console.warn("No external config.json found. Using defaults.", err));

// 📤 Send message event
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 💬 Add message to chat
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "bot") {
    msg.innerHTML = `
      <img src="https://preview.redd.it/what-is-this-goofy-dance-called-v0-c3q5xap1uqye1.gif?width=640&auto=webp&s=f5ade48e1fb0a21d3dc991c7c1d62d17b80bb350" class="avatar">
      <div class="bot-bubble"><p>${text}</p></div>`;
  } else {
    msg.innerHTML = `
      <div class="user-bubble"><p>${text}</p></div>
      <img src="https://media.tenor.com/zCxWDS8FsFQAAAAM/shibuya-station-haru.gif" alt="User" class="avatar">`;
  }

  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  return msg;
}

// 🚀 Send message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  userInput.value = "";

  const thinkingMsg = addMessage("bot", "Thinking... 🌸");

  try {
    const reply = await sendOpenAIRequest(text);
    thinkingMsg.querySelector("p").innerHTML = reply;
  } catch (error) {
    console.error("Error:", error);
    thinkingMsg.querySelector("p").textContent = "Oops! Something went wrong. 🌸";
  }
}

// 🧠 Call Azure OpenAI Proxy
async function sendOpenAIRequest(text) {
  const requestBody = {
    model: _config.openAI_model,
    input: text,
    instructions: _config.ai_instruction,
    previous_response_id: _config.response_id || undefined,
  };

  const response = await fetch(_config.openAI_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

  const data = await response.json();
  const output = data.output?.[0]?.content?.[0]?.text || "No response 🌸";
  _config.response_id = data.id || "";

  return output;
}

// 🎨 Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("theme-sakura");
  document.body.classList.toggle("theme-cyberpunk");
});
