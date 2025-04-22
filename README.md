# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

---

### Structur File Path

> Tree Folder File
> 
- 📁 assets
    
    css
    
- 📚 components
    
    button
    
- 🔧 configs
    
    menu sidebar
    
- 📜 layouts
    
    default
    
- 📄 pages
    
    index
    
    login
    
- 📢 public
    
    faveicon
    
- 🛅 server
- 📦 stores
    
    data
    

---

### VIEW PATH

> View Template Separation
> 
- Layout ( Navbar  ,  Sidebar , [ Content ] , Footer Bar )
    - Main View
        
        

---


### RULES FOR DEVELOPER

---
> Rules
- Penamaan File camel case ex : userAuth.vue
- Nuxt sudah menggunakan Auto Routes, ex : pages/home.vue -> di akses /home, So... jadi hati hati buat bikin nama
- jika ingin tambah package koordinasikan terlebih dahulu, karena bisa terjadi miss call class css ex : text-red ( ini ada di tailwind , ada juga di css native )
- Tambahkan comment untuk menjelaskan function/syntax

---

### RULES FOR PUSH/COMMIT CODE
> Push
- Sebelum push silakan untuk pull dulu agar terhindar dari conflict
- sebelum push mohon di commit pada tiap tiap branch
- tiap fiture/module disimpan dalam beda beda branch dan di merge di development

<center> Made With 💙 From <b> ALPHA TEAM </b> </center>
