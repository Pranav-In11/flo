import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    // PASTE YOUR FIREBASE CONFIG HERE
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 1. Protection: Ensure user is logged in and WH is selected
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html"; // Redirect to login
    } else {
        const whName = localStorage.getItem('active_warehouse_name');
        if (!whName) {
            window.location.href = "warehouse.html"; // Go back to WH selection
        }
        document.getElementById('active-wh').innerText = whName;
        loadMenu();
    }
});

// 2. Load Menu from Firestore
async function loadMenu() {
    const container = document.getElementById('dynamic-menu-container');
    const q = query(collection(db, "menu_categories"), orderBy("order", "asc"));
    
    try {
        const querySnapshot = await getDocs(q);
        container.innerHTML = ''; // Clear loading text

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const categoryHtml = `
                <div class="accordion-item">
                    <div class="accordion-header" data-id="${doc.id}">
                        <span>${data.name}</span>
                        <i class="material-icons">expand_more</i>
                    </div>
                    <div class="accordion-content" id="content-${doc.id}">
                        <table class="mdl-data-table dept-table">
                            <tbody id="list-${doc.id}"></tbody>
                        </table>
                    </div>
                </div>
            `;
            container.innerHTML += categoryHtml;
            
            // Fill tasks for this category
            const listBody = document.getElementById(`list-${doc.id}`);
            data.tasks.forEach(task => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td class="mdl-data-table__cell--non-numeric">${task.title}</td>`;
                tr.onclick = () => window.location.href = task.url;
                listBody.appendChild(tr);
            });
        });

        // Add Click Listeners for Accordion
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const contentId = `content-${header.dataset.id}`;
                document.getElementById(contentId).classList.toggle('open');
            });
        });

    } catch (e) {
        console.error("Error loading menu: ", e);
        container.innerHTML = "Error loading menu structure.";
    }
}

// 3. Logout Logic
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        localStorage.clear();
        window.location.href = "index.html";
    });
});
