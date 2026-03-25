# 🚲 Rydex — Frontend Angular

Frontend para la tienda de bicicletas Rydex, construido con **Angular 17** (Standalone Components + Signals).

---

## 🚀 Instalación y uso

```bash
# 1. Clonar / copiar la carpeta rydex en tu proyecto
# 2. Instalar dependencias
npm install

# 3. Configurar la URL del backend
# Editar src/environments/environment.ts
# Cambiar apiUrl: 'http://localhost:3000/api'  ← URL de tu backend

# 4. Iniciar el servidor de desarrollo
ng serve

# La app estará en http://localhost:4200
```

---

## 📁 Estructura de archivos

```
src/
├── main.ts                          ← Punto de entrada
├── styles.css                       ← Estilos globales + CSS variables
├── environments/
│   └── environment.ts               ← URL del backend (CONFIGURAR AQUÍ)
└── app/
    ├── app.config.ts                ← Providers globales (HTTP, Router)
    ├── app.routes.ts                ← Rutas de la aplicación
    ├── app.component.ts             ← Componente raíz (shell)
    ├── core/
    │   ├── models/
    │   │   └── models.ts            ← Interfaces TypeScript (espejo BD)
    │   └── services/
    │       ├── theme.service.ts     ← Modo oscuro/claro
    │       ├── auth.service.ts      ← Login, logout, token
    │       ├── bike.service.ts      ← Llamadas HTTP a /bicicletas
    │       ├── cart.service.ts      ← Estado del carrito (signals)
    │       └── auth.interceptor.ts  ← Inyecta JWT en cada request
    ├── shared/
    │   └── navbar/
    │       ├── navbar.component.ts
    │       ├── navbar.component.html
    │       └── navbar.component.css
    └── features/
        ├── home/                    ← Galería + filtros (/mountain, /road…)
        ├── product-detail/          ← Detalle de bici (/producto/:id)
        ├── cart/                    ← Carrito de compras (/carrito)
        └── login/                   ← Login (/login)
```

---

## 🔌 Endpoints del Backend requeridos

El frontend espera estos endpoints REST:

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/bicicletas` | Lista con filtros opcionales `?tipo=mountain&marca=Trek&q=texto` |
| GET | `/api/bicicletas/:id` | Detalle de una bicicleta |
| GET | `/api/bicicletas/marcas` | Array de marcas únicas `["Trek","Specialized"...]` |
| POST | `/api/auth/login` | Body: `{email, password}` → `{token, cliente}` |
| POST | `/api/ventas` | Crear venta (requiere token JWT) |

### Ejemplo de respuesta GET /api/bicicletas
```json
{
  "data": [
    {
      "id_bicicleta": 1,
      "sku": "MTB-001",
      "marca": "Trek",
      "modelo": "Summit Trail Pro X",
      "tipo": "Mountain",
      "precio": 5499,
      "stock_minimo": 3,
      "descripcion": "...",
      "imagenes": ["https://..."],
      "especificaciones": {
        "Material": "Carbon Fiber",
        "Weight": "12kg",
        "Drivetrain": "SRAM Eagle"
      },
      "etiqueta": "NEW ARRIVAL"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 12
}
```

---

## 🧠 Conceptos Angular usados

### Standalone Components
Cada componente declara sus propias dependencias en `imports[]`. Ya no existe `AppModule`.

### Signals
```typescript
// Estado reactivo moderno de Angular 17
const count = signal(0);
count.update(v => v + 1);
const double = computed(() => count() * 2); // se recalcula solo
```

### Lazy Loading
Las rutas cargan su código solo cuando el usuario navega a ellas:
```typescript
loadComponent: () => import('./features/home/home.component')
```

### Interceptor HTTP
Automáticamente agrega el token JWT a todas las requests:
```
Authorization: Bearer <token>
```

### @Input() desde la URL
Gracias a `withComponentInputBinding()`, los parámetros de ruta llegan como `@Input()`:
```typescript
@Input() id!: string; // viene de /producto/:id
```

---

## 🎨 Personalización

- **Colores**: Editar las variables en `src/styles.css` (`:root { ... }`)
- **Backend URL**: `src/environments/environment.ts`
- **Rutas**: `src/app/app.routes.ts`