// Generate page script.js

window.onload = function () {
    const apiKeyInput = document.getElementById("apiKey");
    const savedApiKey = localStorage.getItem("geminiApiKey");
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
};

document.getElementById("apiKey").addEventListener("input", function (event) {
    const apiKey = event.target.value;
    localStorage.setItem("geminiApiKey", apiKey);
});

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById("apiKey");
    const eyeIcon = document.getElementById("eyeIcon");

    if (apiKeyInput.type === "password") {
        apiKeyInput.type = "text";
        eyeIcon.setAttribute(
            "d",
            "M13.5 5.5A3 3 0 1116.5 8.5a3 3 0 01-3 3A3 3 0 0110.5 8.5a3 3 0 013-3zM0 19.998V4.998A2.99 2.99 0 012.99 2h18.02a2.99 2.99 0 012.99 2.99v13a2.99 2.99 0 01-2.99 2.99H2.99A2.99 2.99 0 010 19.998zM11 18h2v-2h-2v2zm0-4h2v-2h-2v2zm0-4h2v-2h-2v2z"
        );
    } else {
        apiKeyInput.type = "password";
        eyeIcon.setAttribute(
            "d",
            "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        );
    }
}

// Function to copy a recipe
function copyRecipe() {
    const recipeText = document.getElementById("generatedRecipe").innerText;
    navigator.clipboard
        .writeText(recipeText)
        .then(() => {
            showAlert("Recipe copied successfully!");
        })
        .catch((err) => {
            console.error("Failed to copy recipe: ", err);
        });
}

let likes = 0;
function toggleLike() {
    likes++;
    document.getElementById("likeCount").textContent = likes;
}

function sharePost() {
    const recipeTitle = "Check out this recipe!";
    const recipeDescription = "I found an amazing recipe on Delicious Recipes!";
    const recipeUrl = window.location.href;
    const facebookShareURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}&t=${encodeURIComponent(recipeTitle)}`;
    window.open(facebookShareURL, "_blank", "width=600,height=400,left=100,top=100");
    console.log("Recipe shared on Facebook.");
}

function generateComments() {
    const comments = [
        { user: "Alice", text: "This recipe is fantastic!", delay: 1000 },
        { user: "Bob", text: "Can't wait to make this!", delay: 2000 },
        { user: "Charlie", text: "Perfect for a weekend dinner.", delay: 3000 },
        {
            user: "Diana",
            text: "Replying to Alice: I agree, it's great!",
            delay: 4000,
            replyTo: "Alice",
        },
        { user: "Eve", text: "Is this gluten-free?", delay: 5000 },
    ];

    comments.forEach((comment, index) => {
        setTimeout(() => {
            addComment(comment.user, comment.text, comment.replyTo);
        }, comment.delay + index * 1000);
    });
}

function addComment(user, text, replyTo = null) {
    const commentsSection = document.getElementById("commentsSection");
    const commentDiv = document.createElement("div");
    commentDiv.className = "bg-gray-100 p-4 rounded-lg";

    if (replyTo) {
        commentDiv.innerHTML = `
      <p class="text-sm text-gray-700">Replying to ${replyTo}: ${text}</p>
      <span class="text-xs text-gray-500">- ${user} • ${formatTime(new Date())}</span>
    `;
    } else {
        commentDiv.innerHTML = `
      <p class="text-sm text-gray-700">${text}</p>
      <span class="text-xs text-gray-500">- ${user} • ${formatTime(new Date())}</span>
    `;
    }

    commentsSection.appendChild(commentDiv);
}

function formatTime(date) {
    const diff = (new Date().getTime() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} seconds ago`;
    return `${Math.floor(diff / 60)} minutes ago`;
}

document.getElementById("recipeForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const submitButton = document.querySelector('#recipeForm button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Generating...";

    const apiKey = document.getElementById("apiKey").value;
    const recipeName = document.getElementById("recipeName").value;
    const language = document.getElementById("language").value;

    if (!apiKey) {
        alert("Please enter your API key.");
        submitButton.disabled = false;
        submitButton.textContent = "Generate Recipe";
        return;
    }

    if (!recipeName) {
        alert("Please enter a recipe name.");
        submitButton.disabled = false;
        submitButton.textContent = "Generate Recipe";
        return;
    }

    const prompt = `
    Generate a detailed recipe for "${recipeName}" in ${language}. 
    Include the following sections:
    - A catchy recipe name with emoji.
    - Ingredients list.
    - Step-by-step directions.
    - Nutritional information (prep time, cooking time, total time, servings, and approximate calories per serving).
  `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generation_config: { max_output_tokens: 2048 },
            }),
        });

        const data = await response.json();
        let generatedText = data.candidates[0]?.content.parts[0]?.text || "No recipe generated.";
        generatedText = generatedText.replace(/\*\*/g, "");

        // Remove or replace the '#' symbol
        generatedText = generatedText.replace(/#/g, ""); // Removes all '#' symbols
        // OR
        generatedText = generatedText.replace(/# /g, ""); // Removes '# ' (hash followed by a space)

        const outputDiv = document.getElementById("output");
        const generatedRecipePre = document.getElementById("generatedRecipe");
        generatedRecipePre.innerHTML = generatedText;
        outputDiv.classList.remove("hidden");

        // Generate prompts
        const ahmadBatPrompt = `amateur photo from reddit. taken with an iphone 15 pro. A geographic picture of Close-up of a ${recipeName} JUICY mouthwatering and delicious dish on a (Dish Color) plate, holding by a women's hand. Behind the ${recipeName}, the (Background bhal: City, Beach, swimming pool ...) slightly out of focus. The sky is clear blue. In the midground, there's a grassy area with people lounging. The recipe is clearly visible. The image has a playful, touristy vibe, combining the iconic. The lighting is bright and sunny, giving the scene a cheerful atmosphere.`;
        const anouarSaidiPrompt = `Capture the essence of This Light and refreshing, ${recipeName}. Make our readers crave a bite just by looking at your photo. We want to see it in all its mouthwatering glory, ready to inspire cooks and bakers alike. Get creative with your composition, lighting, and styling Make it look Realistic, camera: iphone, V6`;
        const ahmadJdayPromptV1 = `${recipeName} Amateur photo from Reddit, taken with a Galaxy S2. | Amateur lighting | SHOT TYPE: Focus on the details`;
        const ahmadJdayPromptV2 = `${recipeName} front angle shot, low angle shot, kitchen background, We want to see it in all its mouthwatering glory, ready to inspire cooks and bakers alike. Get creative with your composition, lighting, and styling Make it look Realistic --s 250`;

        // Display prompts
        document.getElementById("ahmadBatPrompt").textContent = ahmadBatPrompt;
        document.getElementById("anouarSaidiPrompt").textContent = anouarSaidiPrompt;
        document.getElementById("ahmadJdayPromptV1").textContent = ahmadJdayPromptV1;
        document.getElementById("ahmadJdayPromptV2").textContent = ahmadJdayPromptV2;
        document.getElementById("promptsSection").classList.remove("hidden");

        // Show success alert
        document.getElementById("alert").classList.remove("hidden");
        setTimeout(() => {
            document.getElementById("alert").classList.add("hidden");
        }, 3000);
    } catch (error) {
        alert("An error occurred while generating the recipe.");
        console.error("Error:", error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Generate Recipe";
    }
});

document.getElementById("recipeForm").addEventListener("submit", function (event) {
    event.preventDefault();
    document.getElementById("output").style.display = "none";

    setTimeout(() => {
        document.getElementById("output").style.display = "block";
        document.getElementById("recipeContent").textContent = "Here is your generated recipe!";
    }, 3000);
});

function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    mobileMenu.classList.toggle("hidden");
}

// Updated saveRecipe function to include prompts
function saveRecipe() {
    const recipeName = document.getElementById("recipeName").value;
    const recipeContent = document.getElementById("generatedRecipe").innerText;
    const language = document.getElementById("language").value;

    const ahmadBatPrompt = document.getElementById("ahmadBatPrompt").innerText;
    const anouarSaidiPrompt = document.getElementById("anouarSaidiPrompt").innerText;
    const ahmadJdayPromptV1 = document.getElementById("ahmadJdayPromptV1").innerText;
    const ahmadJdayPromptV2 = document.getElementById("ahmadJdayPromptV2").innerText;

    if (!recipeName || !recipeContent.trim()) return;

    const recipeData = {
        name: recipeName,
        content: recipeContent,
        language: language,
        prompts: {
            ahmadBatPrompt: ahmadBatPrompt,
            anouarSaidiPrompt: anouarSaidiPrompt,
            ahmadJdayPromptV1: ahmadJdayPromptV1,
            ahmadJdayPromptV2: ahmadJdayPromptV2,
        },
        timestamp: new Date().toISOString(),
    };

    let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    savedRecipes.push(recipeData);
    localStorage.setItem("recipes", JSON.stringify(savedRecipes));

    // Show the save alert
    const saveAlert = document.getElementById("saveAlert");
    saveAlert.classList.remove("hidden");
    saveAlert.classList.add("opacity-100");

    setTimeout(() => {
        saveAlert.classList.remove("opacity-100");
        saveAlert.classList.add("hidden");
    }, 3000); // Hide after 3 seconds
}

function showAlert(message) {
    const alertBox = document.createElement("div");
    alertBox.className = "fixed bottom-5 left-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg opacity-0 transform translate-y-4 transition-all duration-500";
    alertBox.innerText = message;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.classList.remove("opacity-0", "translate-y-4");
        alertBox.classList.add("opacity-100", "translate-y-0");
    }, 100);

    setTimeout(() => {
        alertBox.classList.remove("opacity-100", "translate-y-0");
        alertBox.classList.add("opacity-0", "translate-y-4");
        setTimeout(() => alertBox.remove(), 500);
    }, 3000);
}

const outputContainer = document.getElementById("output");
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0 && !outputContainer.classList.contains("hidden")) {
            showAlert("Recipe generated successfully!");
        }
    });
});

observer.observe(outputContainer, { childList: true, subtree: true });

// Assuming this is where your recipe generation logic ends
function onRecipeGenerated() {
    // Show the output section
    document.getElementById("output").classList.remove("hidden");

    // Show the social buttons and comments section
    document.getElementById("socialAndComments").classList.remove("hidden");

    // Optionally, show the alert notification
    document.getElementById("alert").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("alert").classList.add("hidden");
    }, 3000); // Hide the alert after 3 seconds
}

// Example usage:
// Call onRecipeGenerated() when the recipe generation is complete
// History page script.js

// Toggle Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    mobileMenu.classList.toggle("hidden");
}

// Accordion functionality
function togglePanel(index) {
    const panel = document.getElementById(`panel-${index}`);
    panel.classList.toggle("open");
}

// Delete a recipe
function deleteRecipe(index) {
    let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    savedRecipes.splice(index, 1); // Remove the recipe at the specified index
    localStorage.setItem("recipes", JSON.stringify(savedRecipes)); // Update localStorage
    renderRecipes(); // Re-render the recipe list
}

// Render saved recipes
function renderRecipes() {
    let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    let recipeList = document.getElementById("recipeList");

    // Ensure the language filter defaults to "all" if no value is set
    let languageFilter = document.getElementById("languageFilter").value || "all";
    console.log("Language Filter:", languageFilter); // Debugging line

    if (savedRecipes.length === 0) {
        recipeList.innerHTML = "<p class='text-center text-gray-500'>No saved recipes yet.</p>";
        return;
    }

    recipeList.innerHTML = ""; // Clear the list before re-rendering

    savedRecipes.forEach((recipe, index) => {
        if (languageFilter === "all" || recipe.language === languageFilter) {
            let accordionItem = document.createElement("div");
            accordionItem.classList.add("accordion-item");

            accordionItem.innerHTML = `
        <div class="accordion-header" onclick="togglePanel(${index})">
          <span class="accordion-title">${recipe.name}</span>
          <button onclick="deleteRecipe(${index})" class="delete-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        <div id="panel-${index}" class="accordion-panel">
          <div class="recipe-content">
            <p>${recipe.content}</p>
            ${
                recipe.prompts
                    ? `
              <div class="prompts-section mt-4">
                <h3 class="text-lg font-semibold">Prompts</h3>
                <pre class="bg-gray-100 p-4 rounded">${JSON.stringify(recipe.prompts, null, 2)}</pre>
              </div>
            `
                    : ""
            }
          </div>
        </div>
      `;

            recipeList.appendChild(accordionItem);
        }
    });
}

// Load saved recipes on page load
document.addEventListener("DOMContentLoaded", () => {
    // Set the language filter to "all" by default
    document.getElementById("languageFilter").value = "all";
    // Render recipes
    renderRecipes();
});

// Download CSV functionality
function downloadCSV() {
    let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    if (savedRecipes.length === 0) {
        alert("No recipes to download.");
        return;
    }

    // Define CSV headers
    let csvContent = "recipe_name,generated_recipe,language,ahmadBatPrompt,anouarSaidiPrompt,ahmadJdayPromptV1,ahmadJdayPromptV2\n";

    // Add each recipe and its prompts to the CSV
    savedRecipes.forEach(({ name, content, language, prompts }) => {
        const ahmadBatPrompt = prompts?.ahmadBatPrompt || "";
        const anouarSaidiPrompt = prompts?.anouarSaidiPrompt || "";
        const ahmadJdayPromptV1 = prompts?.ahmadJdayPromptV1 || "";
        const ahmadJdayPromptV2 = prompts?.ahmadJdayPromptV2 || "";

        csvContent += `"${name}","${content.replace(/"/g, '""')}","${language}","${ahmadBatPrompt.replace(/"/g, '""')}","${anouarSaidiPrompt.replace(/"/g, '""')}","${ahmadJdayPromptV1.replace(/"/g, '""')}","${ahmadJdayPromptV2.replace(
            /"/g,
            '""'
        )}"\n`;
    });

    // Create and download the CSV file
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "recipes.csv";
    link.click();
}

// Add scroll effect to header
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});
