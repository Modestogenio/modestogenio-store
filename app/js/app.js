let products = []
let activeCategory = 'todos'

const CATEGORIES = [
  { id: 'todos', label: 'Todos', icon: '🏪' },
  { id: 'software', label: 'Software', icon: '💻' },
  { id: 'manuales', label: 'Manuales', icon: '📖' },
  { id: 'recetarios', label: 'Recetarios', icon: '🍪' },
  { id: 'libros', label: 'Libros', icon: '📱' },
  { id: 'cursos', label: 'Cursos', icon: '🎓' }
]

const CATEGORY_COLORS = {
  software: '#3b82f6',
  manuales: '#10b981',
  recetarios: '#ec4899',
  libros: '#06b6d4',
  cursos: '#f97316'
}

async function loadProducts() {
  try {
    const res = await fetch('products/products.json')
    products = await res.json()
    render()
  } catch (e) {
    document.getElementById('products-grid').innerHTML =
      `<div class="product-card" style="grid-column:1/-1;text-align:center;padding:40px">
        <p>🔌 Cargando productos...</p>
        <p style="color:var(--text2);font-size:0.85rem;margin-top:8px">
          Asegúrate de que products/products.json exista
        </p>
      </div>`
  }
}

function render() {
  renderStats()
  renderCategories()
  renderProducts()
}

function renderStats() {
  const total = products.length
  const categories = new Set(products.map(p => p.category)).size
  const minPrice = Math.min(...products.map(p => p.price))
  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-item">
      <div class="stat-num">${total}</div>
      <div class="stat-lbl">Productos</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">${categories}</div>
      <div class="stat-lbl">Categorías</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">Desde $${minPrice}</div>
      <div class="stat-lbl">Precio mínimo</div>
    </div>
  `
}

function renderCategories() {
  const el = document.getElementById('categories')
  el.innerHTML = CATEGORIES.map(c =>
    `<button class="cat-btn ${activeCategory === c.id ? 'active' : ''}"
              onclick="filterCategory('${c.id}')">
       ${c.icon} ${c.label}
     </button>`
  ).join('')
}

function filterCategory(catId) {
  activeCategory = catId
  renderCategories()
  renderProducts()
}

function renderProducts() {
  const filtered = activeCategory === 'todos'
    ? products
    : products.filter(p => p.category === activeCategory)

  const grid = document.getElementById('products-grid')

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text2)">
      No hay productos en esta categoría aún.
    </div>`
    return
  }

  grid.innerHTML = filtered.map(p => {
    const color = p.color || CATEGORY_COLORS[p.category] || '#f59e0b'
    return `
      <div class="product-card" onclick="openProduct('${p.id}')">
        <div class="product-icon" style="background:${color}22">
          ${p.image_emoji || '📦'}
        </div>
        <div class="product-category">${p.category}</div>
        <div class="product-title">${p.title}</div>
        <div class="product-desc">${p.description.substring(0, 100)}...</div>
        <div class="product-footer">
          <span class="product-price">$${p.price}</span>
          <span class="btn btn-sm" style="background:${color};color:#fff;padding:6px 12px;border-radius:8px;font-weight:600">
            Ver más →
          </span>
        </div>
      </div>
    `
  }).join('')
}

function openProduct(id) {
  const p = products.find(x => x.id === id)
  if (!p) return
  const color = p.color || CATEGORY_COLORS[p.category] || '#f59e0b'

  const isFree = p.price === 0
  const paypalLink = `https://paypal.me/marcelocorales/${p.paypal_amount}`
  const paypalMsg = encodeURIComponent(`Compra: ${p.title} - Modestogenio Store`)

  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div class="product-icon" style="background:${color}22;width:56px;height:56px;font-size:1.5rem;border-radius:12px;display:flex;align-items:center;justify-content:center">
        ${p.image_emoji || '📦'}
      </div>
      <div>
        <div class="product-category" style="margin-bottom:0">${p.category}</div>
        <h2 style="font-size:1.3rem">${p.title}</h2>
      </div>
    </div>
    <div class="modal-price">${isFree ? 'GRATIS' : `$${p.price} USD`}</div>
    <div class="modal-desc">${p.description}</div>

    ${p.features ? `
      <ul class="modal-features">
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    ` : ''}

    ${p.includes ? `
      <div class="modal-includes">
        <strong>📦 Incluye:</strong> ${p.includes}
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      <a href="${paypalLink}/${paypalMsg}" target="_blank" class="btn-buy">
        ${isFree ? 'Descargar Gratis' : `Comprar con PayPal — $${p.price}`}
        <span>Pago único · Recibes el producto inmediatamente</span>
      </a>
      ${p.download_url ? `
        <a href="${p.download_url}" target="_blank" class="btn-download">
          📥 Más información / Acceso directo
        </a>
      ` : ''}
    </div>

    <p style="text-align:center;font-size:0.8rem;color:var(--text2);margin-top:12px">
      💡 Al comprar, incluye "Producto: ${p.title}" en la nota de PayPal
      para recibir el enlace de descarga a tu email.
    </p>
  `

  document.getElementById('modal').classList.remove('hidden')
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden')
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal()
})

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal()
})

loadProducts()
