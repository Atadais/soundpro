// main.js - Единый JavaScript для всего сайта SoundPro

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initPhoneMasks();
    initForms();
    initAnimations();
    
    const page = getCurrentPage();
    
    if (page === 'catalog') {
        initCatalog();
    } else if (page === 'register') {
        initRegister();
    } else if (page === 'cabinet') {
        initCabinet();
    } else if (page === 'request') {
        initRequest();
    } else if (page === 'contacts') {
        initContacts();
    } else if (page === 'admin') {
        initAdmin();
    }
});

function getCurrentPage() {
    const path = window.location.pathname.split('/').pop();
    if (!path || path === 'index.html') return 'index';
    return path.replace('.html', '');
}

// ==================== БАЗОВЫЕ ФУНКЦИИ ====================
function initNavigation() {
    const userData = JSON.parse(localStorage.getItem('user'));
    const loginLink = document.getElementById('loginLink');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const logoutLink = document.getElementById('logoutLink');
    
    if (userData && userInfo) {
        if (loginLink) loginLink.style.display = 'none';
        userInfo.style.display = 'flex';
        if (userName) userName.textContent = userData.name;
        if (userAvatar) userAvatar.textContent = getInitials(userData.name);
        
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        }
    }
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency', currency: 'RUB', minimumFractionDigits: 0
    }).format(price);
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

function initPhoneMasks() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') value = '+7' + value.substring(1);
                else value = '+7' + value;
                if (value.length > 2) value = value.substring(0, 2) + ' (' + value.substring(2);
                if (value.length > 7) value = value.substring(0, 7) + ') ' + value.substring(7);
                if (value.length > 12) value = value.substring(0, 12) + '-' + value.substring(12);
                if (value.length > 15) value = value.substring(0, 15) + '-' + value.substring(15);
            }
            e.target.value = value.substring(0, 18);
        });
    });
}

function initForms() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) e.preventDefault();
        });
    });
}

function initAnimations() {
    document.querySelectorAll('.animate').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
    });
}

function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        input.classList.remove('error', 'shake');
        const errorElement = input.nextElementSibling?.classList.contains('error-message') 
            ? input.nextElementSibling : null;
        
        if (!input.value.trim()) {
            input.classList.add('error', 'shake');
            if (errorElement) {
                errorElement.textContent = 'Это поле обязательно для заполнения';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            input.classList.add('error', 'shake');
            if (errorElement) {
                errorElement.textContent = 'Введите корректный email';
                errorElement.style.display = 'block';
            }
            isValid = false;
        } else if (input.type === 'tel') {
            const cleaned = input.value.replace(/\D/g, '');
            if (cleaned.length < 11) {
                input.classList.add('error', 'shake');
                if (errorElement) {
                    errorElement.textContent = 'Введите корректный номер телефона';
                    errorElement.style.display = 'block';
                }
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function checkAuth() {
    return JSON.parse(localStorage.getItem('user')) || null;
}

function isAdmin() {
    const userData = JSON.parse(localStorage.getItem('user'));
    return userData && userData.role === 'admin';
}

function requireAuth() {
    const userData = checkAuth();
    if (!userData) {
        window.location.href = 'register.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ==================== МОДАЛЬНОЕ ОКНО ТОВАРА ====================
function showProductModal(product) {
    const existingModal = document.querySelector('.product-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'modal product-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close-btn">&times;</button>
            <img src="${product.image}" alt="${product.name}" class="product-modal-image">
            <div class="product-modal-body">
                <span class="product-modal-category">${product.category}</span>
                <h2 class="product-modal-title">${product.name}</h2>
                <p class="product-modal-price">${formatPrice(product.price)}</p>
                <p class="product-modal-description">${product.fullDescription || product.description}</p>
                <ul class="product-modal-specs">
                    ${product.specs.map(spec => `<li><i class="fas fa-check"></i> ${spec}</li>`).join('')}
                </ul>
                <button class="btn btn-accent btn-block close-modal-btn">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    
    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ==================== КАТАЛОГ ====================
function initCatalog() {
    loadEquipmentTypes();
    loadEquipment();
    initCatalogFilters();
    initCatalogSearch();
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreEquipment);
}

function loadEquipmentTypes() {
    const types = ['Беспроводные', 'Студийные', 'Мониторные', 'Открытые', 'Закрытые', 'Внутриканальные', 'Накладные', 'Игровые'];
    const container = document.getElementById('typeFilters');
    if (!container) return;
    
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'Все';
    allBtn.dataset.type = 'all';
    container.appendChild(allBtn);
    
    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = type;
        btn.dataset.type = type.toLowerCase();
        container.appendChild(btn);
    });
}

function initCatalogFilters() {
    document.querySelectorAll('#typeFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#typeFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterEquipmentByType(this.dataset.type);
        });
    });
    
    document.querySelectorAll('#priceFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#priceFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterEquipmentByPrice(this.dataset.price);
        });
    });
}

function initCatalogSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.addEventListener('click', searchEquipment);
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') searchEquipment();
        });
    }
}

function loadEquipment() {
    const equipment = [
        { 
            id: 1, name: 'Sony WH-1000XM5', category: 'Беспроводные', price: 34990, 
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 
            specs: ['Bluetooth 5.2', 'Активное шумоподавление', '30 часов работы', 'Сенсорное управление'], 
            description: 'Флагманские беспроводные наушники с лучшим в классе шумоподавлением.',
            fullDescription: 'Sony WH-1000XM5 — это флагманские беспроводные наушники с лучшим в отрасли шумоподавлением. Восемь микрофонов и два процессора обеспечивают невероятное качество шумоподавления. Наушники автоматически оптимизируют шумоподавление в зависимости от условий окружающей среды. Технология Precise Voice Pickup использует четыре микрофона и датчик костной проводимости для идеальной передачи голоса при звонках.'
        },
        { 
            id: 2, name: 'Beyerdynamic DT 770 Pro', category: 'Студийные', price: 18990, 
            image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 
            specs: ['80 Ом', 'Частоты: 5-35000 Гц', 'Закрытый тип', 'Кабель 3м'], 
            description: 'Легендарные студийные наушники для профессиональной работы со звуком.',
            fullDescription: 'Beyerdynamic DT 770 Pro — легендарные студийные наушники, используемые профессионалами по всему миру. Закрытая конструкция обеспечивает отличную звукоизоляцию, что делает их идеальными для записи вокала и инструментов. Точное и детальное звучание с глубокими басами и чистыми высокими частотами. Прочная конструкция и сменные амбушюры гарантируют долгий срок службы.'
        },
        { 
            id: 3, name: 'Sennheiser HD 600', category: 'Открытые', price: 28990, 
            image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', 
            specs: ['300 Ом', 'Частоты: 12-40500 Гц', 'Открытый тип', 'Кабель 3м'], 
            description: 'Эталонные открытые наушники для аудиофилов и профессионалов.',
            fullDescription: 'Sennheiser HD 600 — эталонные открытые наушники, признанный стандарт в мире аудио. Благодаря открытой конструкции и специально разработанным динамикам обеспечивают невероятно натуральное и просторное звучание. Идеально подходят для критического прослушивания, сведения и мастеринга. Лёгкая конструкция и велюровые амбушюры обеспечивают комфорт даже при длительном использовании.'
        },
        { 
            id: 4, name: 'Audio-Technica ATH-M50x', category: 'Мониторные', price: 15990, 
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 
            specs: ['38 Ом', 'Частоты: 15-28000 Гц', 'Закрытый тип', 'Съемный кабель'], 
            description: 'Популярные мониторные наушники для студии и дома.',
            fullDescription: 'Audio-Technica ATH-M50x — одни из самых популярных мониторных наушников в мире. Обеспечивают точное и сбалансированное звучание с отличной детализацией. Складная конструкция и съёмные кабели делают их удобными для транспортировки. Идеальный выбор для звукорежиссёров, музыкантов и просто любителей качественного звука.'
        },
        { 
            id: 5, name: 'Bose QuietComfort 45', category: 'Беспроводные', price: 29990, 
            image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500', 
            specs: ['Bluetooth 5.1', 'Активное шумоподавление', '24 часа работы', 'Режим прозрачности'], 
            description: 'Комфортные беспроводные наушники с отличным шумоподавлением.',
            fullDescription: 'Bose QuietComfort 45 — эталон комфорта среди беспроводных наушников. Легендарная система шумоподавления Bose эффективно блокирует внешние шумы, а режим Aware позволяет слышать окружающий мир, не снимая наушники. Мягкие амбушюры и лёгкая конструкция позволяют носить их весь день без усталости. Качество звука оптимизировано для любых жанров музыки.'
        },
        { 
            id: 6, name: 'AKG K712 Pro', category: 'Открытые', price: 22990, 
            image: 'https://images.unsplash.com/photo-1505740106531-4243f3831c78?w=500', 
            specs: ['62 Ом', 'Частоты: 10-39800 Гц', 'Открытый тип', 'Кабель 3м'], 
            description: 'Профессиональные открытые наушники для сведения и мастеринга.',
            fullDescription: 'AKG K712 Pro — профессиональные открытые наушники для точного мониторинга. Обеспечивают широкую звуковую сцену и исключительную детализацию, что делает их идеальными для сведения и мастеринга. Технология плоских звуковых катушек обеспечивает точное воспроизведение импульсных сигналов. Мягкое велюровое оголовье и амбушюры с эффектом памяти гарантируют максимальный комфорт.'
        }
    ];
    
    localStorage.setItem('equipment', JSON.stringify(equipment));
    renderEquipment(equipment);
}

function renderEquipment(equipmentList) {
    const container = document.getElementById('equipmentGrid');
    if (!container) return;
    container.innerHTML = '';
    
    equipmentList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card animate';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="equipment-image">
            <div class="equipment-content">
                <span class="equipment-category">${item.category}</span>
                <h3 class="equipment-title">${item.name}</h3>
                <ul class="equipment-specs">
                    ${item.specs.slice(0, 3).map(spec => `<li><i class="fas fa-check"></i> ${spec}</li>`).join('')}
                </ul>
                <p class="equipment-price">${formatPrice(item.price)}</p>
            </div>
        `;
        card.addEventListener('click', () => showProductModal(item));
        container.appendChild(card);
    });
}

function filterEquipmentByType(type) {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    if (type === 'all') renderEquipment(equipment);
    else renderEquipment(equipment.filter(item => item.category.toLowerCase() === type));
}

function filterEquipmentByPrice(priceRange) {
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    let filtered;
    switch(priceRange) {
        case 'low': filtered = equipment.filter(item => item.price < 10000); break;
        case 'medium': filtered = equipment.filter(item => item.price >= 10000 && item.price <= 30000); break;
        case 'high': filtered = equipment.filter(item => item.price > 30000); break;
        default: filtered = equipment;
    }
    renderEquipment(filtered);
}

function searchEquipment() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const equipment = JSON.parse(localStorage.getItem('equipment') || '[]');
    if (!searchTerm) { renderEquipment(equipment); return; }
    renderEquipment(equipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    ));
}

let loadMoreCount = 0;
function loadMoreEquipment() {
    const btn = document.getElementById('loadMoreBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    setTimeout(() => {
        if (loadMoreCount === 0) {
            const newEquipment = [
                { id: 7, name: 'Shure SRH840', category: 'Мониторные', price: 12990, image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500', specs: ['44 Ом', 'Частоты: 5-25000 Гц', 'Закрытый тип', 'Съемный кабель'], description: 'Профессиональные мониторные наушники.', fullDescription: 'Shure SRH840 — профессиональные мониторные наушники с точным и детальным звучанием. Оптимизированы для критического прослушивания и мониторинга.' },
                { id: 8, name: 'JBL Quantum 800', category: 'Игровые', price: 14990, image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500', specs: ['Bluetooth 5.0', 'Объемный звук', '14 часов работы', 'Микрофон'], description: 'Игровые наушники с объемным звуком.', fullDescription: 'JBL Quantum 800 — игровые наушники с объёмным звуком JBL QuantumSURROUND. Активное шумоподавление и отключаемый микрофон делают их универсальными.' }
            ];
            const existing = JSON.parse(localStorage.getItem('equipment') || '[]');
            localStorage.setItem('equipment', JSON.stringify([...existing, ...newEquipment]));
            renderEquipment([...existing, ...newEquipment]);
            loadMoreCount++;
        }
        btn.innerHTML = '<i class="fas fa-check"></i> Все загружено';
        btn.disabled = true;
    }, 1000);
}

// ==================== РЕГИСТРАЦИЯ ====================
function initRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    const loginInput = document.getElementById('login');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const phoneInput = document.getElementById('phone');
    const agreeCheckbox = document.getElementById('agree');
    
    const existingLogins = ['admin', 'user'];
    
    function validateFullName(name) {
        return /^[А-Яа-яёЁ\s\-]+$/.test(name);
    }
    
    function validateLogin(login) {
        return /^[a-zA-Z0-9]+$/.test(login);
    }
    
    loginInput?.addEventListener('input', function() {
        const login = this.value.trim();
        const errorEl = document.getElementById('loginError');
        const successEl = document.getElementById('loginSuccess');
        if (!login) return;
        if (!validateLogin(login)) {
            this.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        } else if (existingLogins.includes(login.toLowerCase())) {
            this.classList.add('error');
            if (errorEl) { errorEl.textContent = 'Этот логин уже занят'; errorEl.style.display = 'block'; }
        } else {
            this.classList.remove('error');
            this.classList.add('success');
            if (errorEl) errorEl.style.display = 'none';
            if (successEl) successEl.style.display = 'block';
        }
    });
    
    fullNameInput?.addEventListener('input', function() {
        const errorEl = document.getElementById('fullNameError');
        if (!validateFullName(this.value.trim())) {
            this.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        } else {
            this.classList.remove('error');
            this.classList.add('success');
            if (errorEl) errorEl.style.display = 'none';
        }
    });
    
    emailInput?.addEventListener('input', function() {
        const errorEl = document.getElementById('emailError');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.trim())) {
            this.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        } else {
            this.classList.remove('error');
            this.classList.add('success');
            if (errorEl) errorEl.style.display = 'none';
        }
    });
    
    passwordInput?.addEventListener('input', function() {
        const errorEl = document.getElementById('passwordError');
        if (this.value.length < 6) {
            this.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        } else {
            this.classList.remove('error');
            this.classList.add('success');
            if (errorEl) errorEl.style.display = 'none';
        }
    });
    
    confirmPasswordInput?.addEventListener('input', function() {
        const errorEl = document.getElementById('confirmPasswordError');
        if (this.value !== passwordInput.value) {
            this.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        } else {
            this.classList.remove('error');
            this.classList.add('success');
            if (errorEl) errorEl.style.display = 'none';
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        
        if (!fullNameInput.value.trim() || !validateFullName(fullNameInput.value.trim())) {
            fullNameInput.classList.add('error', 'shake');
            document.getElementById('fullNameError').style.display = 'block';
            isValid = false;
        }
        if (!loginInput.value.trim() || !validateLogin(loginInput.value.trim())) {
            loginInput.classList.add('error', 'shake');
            document.getElementById('loginError').style.display = 'block';
            isValid = false;
        }
        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailInput.classList.add('error', 'shake');
            document.getElementById('emailError').style.display = 'block';
            isValid = false;
        }
        if (!phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 11) {
            phoneInput.classList.add('error', 'shake');
            document.getElementById('phoneError').style.display = 'block';
            isValid = false;
        }
        if (passwordInput.value.length < 6) {
            passwordInput.classList.add('error', 'shake');
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.classList.add('error', 'shake');
            document.getElementById('confirmPasswordError').style.display = 'block';
            isValid = false;
        }
        if (!agreeCheckbox.checked) {
            document.getElementById('agreeError').style.display = 'block';
            isValid = false;
        }
        
        if (!isValid) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push({
            fullName: fullNameInput.value.trim(),
            login: loginInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            role: 'user',
            regDate: new Date().toLocaleString('ru-RU')
        });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('user', JSON.stringify({
            login: loginInput.value.trim(),
            name: fullNameInput.value.trim(),
            role: 'user'
        }));
        
        alert(`Регистрация успешна! Добро пожаловать, ${fullNameInput.value.trim()}!`);
        window.location.href = 'cabinet.html';
    });
}

// ==================== ВХОД ====================
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const login = document.getElementById('loginInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        
        const testAccounts = {
            'admin': { password: 'admin', role: 'admin', name: 'Администратор' },
            'user': { password: 'user123', role: 'user', name: 'Иван Иванов' }
        };
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.login === login && u.password === password) || testAccounts[login];
        
        if (user && (user.password === password || testAccounts[login])) {
            localStorage.setItem('user', JSON.stringify({
                login: login,
                name: user.fullName || user.name,
                role: user.role
            }));
            alert(`Добро пожаловать, ${user.fullName || user.name}!`);
            window.location.href = user.role === 'admin' ? 'admin.html' : 'cabinet.html';
        } else {
            alert('Неверный логин или пароль');
        }
    });
}

// ==================== ЛИЧНЫЙ КАБИНЕТ ====================
function initCabinet() {
    if (!requireAuth()) return;
    
    const userData = checkAuth();
    const welcomeEl = document.getElementById('welcomeUserName');
    if (welcomeEl) welcomeEl.textContent = userData.name;
    
    loadUserRequests();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterRequests(this.dataset.filter);
        });
    });
}

function loadUserRequests() {
    let requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    const userData = checkAuth();
    requests = requests.filter(r => r.userId === userData.login);
    
    updateUserStats(requests);
    renderUserRequests(requests);
}

function updateUserStats(requests) {
    document.getElementById('totalRequests').textContent = requests.length;
    document.getElementById('newRequests').textContent = requests.filter(r => r.status === 'new').length;
    document.getElementById('solvedRequests').textContent = requests.filter(r => r.status === 'solved').length;
    document.getElementById('rejectedRequests').textContent = requests.filter(r => r.status === 'rejected').length;
}

function renderUserRequests(requests) {
    const container = document.getElementById('requestsList');
    const emptyState = document.getElementById('emptyState');
    
    if (requests.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = '';
    
    requests.forEach(request => {
        const statusClass = `status-${request.status}`;
        const statusText = request.status === 'new' ? 'Новая' : request.status === 'solved' ? 'Решена' : 'Отклонена';
        
        const el = document.createElement('div');
        el.className = `request-item ${request.status}`;
        el.innerHTML = `
            <div class="request-header">
                <div>
                    <div class="request-title">${request.title}</div>
                    <div class="request-date">${request.date}</div>
                </div>
                <span class="request-status ${statusClass}">${statusText}</span>
            </div>
            <div class="request-body"><p class="request-description">${request.description}</p></div>
            <div class="request-footer">
                <span class="request-category">${request.category}</span>
                <div class="request-actions">
                    ${request.status === 'new' ? `<button class="btn btn-danger btn-sm" data-id="${request.id}"><i class="fas fa-trash"></i> Удалить</button>` : ''}
                </div>
            </div>
        `;
        
        const delBtn = el.querySelector('.btn-danger');
        if (delBtn) delBtn.addEventListener('click', () => deleteRequest(request.id));
        
        container.appendChild(el);
    });
}

function filterRequests(filter) {
    let requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    const userData = checkAuth();
    requests = requests.filter(r => r.userId === userData.login);
    
    if (filter !== 'all') requests = requests.filter(r => r.status === filter);
    renderUserRequests(requests);
}

function deleteRequest(id) {
    if (!confirm('Удалить эту заявку?')) return;
    
    let requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    requests = requests.filter(r => r.id !== id);
    localStorage.setItem('allRequests', JSON.stringify(requests));
    loadUserRequests();
}

// ==================== СОЗДАНИЕ ЗАЯВКИ ====================
function initRequest() {
    if (!requireAuth()) return;
    
    loadRequestCategories();
    
    const form = document.getElementById('requestForm');
    if (!form) return;
    
    let selectedCategory = null;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('requestTitle').value.trim();
        const description = document.getElementById('requestDescription').value.trim();
        const address = document.getElementById('requestAddress').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();
        const date = document.getElementById('serviceDate').value;
        const time = document.getElementById('serviceTime').value;
        const payment = document.querySelector('input[name="payment"]:checked')?.value;
        
        if (!title || !description || !address || !contactPhone || !date || !time || !payment || !selectedCategory) {
            alert('Заполните все поля!');
            return;
        }
        
        createRequest(title, description, selectedCategory, address, contactPhone, date, time, payment);
    });
}

function loadRequestCategories() {
    const categories = ['Диагностика', 'Ремонт', 'Чистка', 'Замена амбушюр', 'Замена кабеля', 'Настройка', 'Консультация'];
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    categories.forEach((cat, i) => {
        const badge = document.createElement('div');
        badge.className = 'category-badge';
        badge.textContent = cat;
        badge.dataset.id = i + 1;
        badge.addEventListener('click', function() {
            document.querySelectorAll('.category-badge').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            window.selectedCategory = cat;
            document.getElementById('categoryError').style.display = 'none';
        });
        container.appendChild(badge);
    });
}

function createRequest(title, description, category, address, contactPhone, date, time, payment) {
    const userData = checkAuth();
    
    const newRequest = {
        id: Date.now(),
        userId: userData.login,
        userName: userData.name,
        title: title,
        description: description,
        category: category,
        address: address,
        contactPhone: contactPhone,
        serviceDateTime: `${date} ${time}`,
        payment: payment,
        date: new Date().toLocaleString('ru-RU'),
        status: 'new'
    };
    
    let allRequests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    allRequests.push(newRequest);
    localStorage.setItem('allRequests', JSON.stringify(allRequests));
    
    alert('Заявка успешно создана!');
    window.location.href = 'cabinet.html';
}

// ==================== КОНТАКТЫ ====================
function initContacts() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        
        if (!name || !phone || !email || !message) {
            alert('Заполните все поля!');
            return;
        }
        
        const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
        contacts.push({ name, phone, email, message, date: new Date().toLocaleString('ru-RU') });
        localStorage.setItem('contacts', JSON.stringify(contacts));
        
        alert('Сообщение отправлено!');
        form.reset();
    });
}

// ==================== АДМИН ПАНЕЛЬ ====================
function initAdmin() {
    if (!requireAdmin()) return;
    
    initAdminTabs();
    loadAdminData();
    
    document.getElementById('logoutLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

function initAdminTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}Tab`).classList.add('active');
        });
    });
}

function loadAdminData() {
    loadAdminRequests();
    loadAdminCategories();
    loadAdminUsers();
    updateAdminStats();
}

function loadAdminRequests() {
    let requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    if (requests.length === 0) {
        requests = generateTestRequests();
        localStorage.setItem('allRequests', JSON.stringify(requests));
    }
    
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    requests.forEach(req => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${req.id}</td>
            <td>${req.date}</td>
            <td>${req.userName}</td>
            <td>${req.title}</td>
            <td>${req.category}</td>
            <td><span class="status-badge status-${req.status}">${getStatusText(req.status)}</span></td>
            <td>
                <div class="action-buttons">
                    ${req.status === 'new' ? `
                        <button class="btn btn-success btn-sm" data-id="${req.id}" data-action="solve"><i class="fas fa-check"></i></button>
                        <button class="btn btn-danger btn-sm" data-id="${req.id}" data-action="reject"><i class="fas fa-times"></i></button>
                    ` : ''}
                </div>
            </td>
        `;
        
        row.querySelector('[data-action="solve"]')?.addEventListener('click', () => solveRequest(req.id));
        row.querySelector('[data-action="reject"]')?.addEventListener('click', () => rejectRequest(req.id));
        
        tbody.appendChild(row);
    });
}

function loadAdminCategories() {
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    if (categories.length === 0) {
        categories = ['Диагностика', 'Ремонт', 'Чистка', 'Замена амбушюр', 'Замена кабеля', 'Настройка', 'Консультация'].map((n, i) => ({ id: i + 1, name: n }));
        localStorage.setItem('categories', JSON.stringify(categories));
    }
    
    const container = document.getElementById('categoriesList');
    if (!container) return;
    container.innerHTML = '';
    
    categories.forEach(cat => {
        const el = document.createElement('div');
        el.className = 'category-item';
        el.innerHTML = `
            <span class="category-name">${cat.name}</span>
            <div class="category-actions">
                <button class="btn btn-danger btn-sm" data-id="${cat.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        el.querySelector('button').addEventListener('click', () => deleteCategory(cat.id));
        container.appendChild(el);
    });
    
    document.getElementById('addCategoryBtn')?.addEventListener('click', addCategory);
}

function loadAdminUsers() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.login === 'admin')) {
        users.push({ fullName: 'Администратор', login: 'admin', email: 'admin@soundpro.ru', role: 'admin', regDate: '01.01.2025' });
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    
    users.forEach(user => {
        const reqCount = requests.filter(r => r.userId === user.login).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.login}</td>
            <td>${user.fullName}</td>
            <td>${user.login}</td>
            <td>${user.email}</td>
            <td>${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
            <td>${reqCount}</td>
            <td>${user.regDate || 'Неизвестно'}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateAdminStats() {
    const requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalRequests').textContent = requests.length;
    document.getElementById('newRequests').textContent = requests.filter(r => r.status === 'new').length;
    document.getElementById('solvedRequests').textContent = requests.filter(r => r.status === 'solved').length;
}

function generateTestRequests() {
    const test = [];
    for (let i = 1; i <= 10; i++) {
        test.push({
            id: Date.now() + i,
            userId: 'user',
            userName: 'Иван Иванов',
            title: `Тестовая заявка ${i}`,
            description: `Описание заявки ${i}`,
            category: 'Диагностика',
            date: new Date().toLocaleString('ru-RU'),
            status: ['new', 'solved', 'rejected'][Math.floor(Math.random() * 3)]
        });
    }
    return test;
}

function getStatusText(status) {
    return status === 'new' ? 'Новая' : status === 'solved' ? 'Решена' : 'Отклонена';
}

function solveRequest(id) {
    updateRequestStatus(id, 'solved');
}

function rejectRequest(id) {
    const reason = prompt('Укажите причину отклонения:');
    if (reason) updateRequestStatus(id, 'rejected', reason);
}

function updateRequestStatus(id, status, reason = '') {
    let requests = JSON.parse(localStorage.getItem('allRequests') || '[]');
    const idx = requests.findIndex(r => r.id === id);
    if (idx !== -1) {
        requests[idx].status = status;
        if (reason) requests[idx].rejectReason = reason;
        localStorage.setItem('allRequests', JSON.stringify(requests));
        loadAdminRequests();
        updateAdminStats();
    }
}

function addCategory() {
    const input = document.getElementById('newCategoryName');
    const name = input.value.trim();
    if (!name) { alert('Введите название'); return; }
    
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories.push({ id: Date.now(), name: name });
    localStorage.setItem('categories', JSON.stringify(categories));
    loadAdminCategories();
    input.value = '';
}

function deleteCategory(id) {
    if (!confirm('Удалить категорию?')) return;
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories = categories.filter(c => c.id != id);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadAdminCategories();
}