const API_URL = 'https://fakestoreapi.com/products';

function mostrarMensaje(contenedor, mensaje, tipo = 'info') {
  const columna = document.createElement('div');
  columna.className = 'col-12';
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} mb-0`;
  alerta.setAttribute('role', tipo === 'danger' ? 'alert' : 'status');
  alerta.textContent = mensaje;
  columna.appendChild(alerta);
  contenedor.replaceChildren(columna);
}

function crearBotonDetalles(producto, texto = 'Ver detalles', clase = 'btn btn-primary') {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clase;
  boton.dataset.productId = producto.id;
  boton.textContent = texto;
  return boton;
}

function crearTarjetaProducto(producto, esOferta = false) {
  const columna = document.createElement('div');
  columna.className = esOferta
    ? 'col-12 col-sm-6 col-lg-4'
    : 'col-12 col-sm-6 col-lg-4 col-xl-3';

  const tarjeta = document.createElement('article');
  tarjeta.className = `card product-card${esOferta ? ' offer-card' : ''}`;

  if (esOferta) {
    const badge = document.createElement('span');
    badge.className = 'badge text-bg-danger';
    badge.textContent = '🔥 OFERTA';
    tarjeta.appendChild(badge);
  }

  const imagen = document.createElement('img');
  imagen.className = 'card-img-top';
  imagen.src = producto.image;
  imagen.alt = producto.title || 'Imagen del producto';
  imagen.loading = 'lazy';
  tarjeta.appendChild(imagen);

  const contenido = document.createElement('div');
  contenido.className = 'card-body d-flex flex-column';

  const titulo = document.createElement('h3');
  titulo.className = 'card-title fs-6';
  titulo.textContent = producto.title;

  const precio = document.createElement('p');
  precio.className = 'product-price mt-auto';
  precio.textContent = `$${Number(producto.price).toFixed(2)}`;

  const boton = crearBotonDetalles(
    producto,
    esOferta ? 'Ver oferta' : 'Ver detalles',
    `btn ${esOferta ? 'btn-danger' : 'btn-primary'} w-100`
  );

  contenido.append(titulo, precio, boton);
  tarjeta.appendChild(contenido);
  columna.appendChild(tarjeta);
  return columna;
}

async function obtenerProductos() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) {
      throw new Error(`La API respondió con el estado ${respuesta.status}.`);
    }

    const productos = await respuesta.json();
    if (!Array.isArray(productos)) {
      throw new Error('La API no devolvió una lista de productos válida.');
    }
    return productos;
  } catch (error) {
    console.error('No se pudieron obtener los productos:', error);
    throw error;
  }
}

function mostrarCatalogo(productos) {
  const seccionCatalogo = document.getElementById('catalogo');
  const catalogo = seccionCatalogo.querySelector('#catalogo-contenido');
  if (!productos.length) {
    mostrarMensaje(catalogo, 'No hay productos disponibles en este momento.');
    return;
  }

  const fragmento = document.createDocumentFragment();
  productos.forEach((producto) => fragmento.appendChild(crearTarjetaProducto(producto)));
  catalogo.replaceChildren(fragmento);
}

function mostrarOfertas(productos) {
  const seccionOfertas = document.getElementById('ofertas');
  const ofertas = seccionOfertas.querySelector('#ofertas-contenido');
  const seleccion = [productos[0], productos[3], productos[6]].filter(Boolean);
  if (!seleccion.length) {
    mostrarMensaje(ofertas, 'No hay ofertas disponibles en este momento.');
    return;
  }

  const fragmento = document.createDocumentFragment();
  seleccion.forEach((producto) => fragmento.appendChild(crearTarjetaProducto(producto, true)));
  ofertas.replaceChildren(fragmento);
}

function mostrarCarrusel(productos) {
  const carrusel = document.getElementById('carrusel');
  const contenido = document.getElementById('carrusel-contenido');
  const seleccion = [...productos];
  for (let indice = seleccion.length - 1; indice > 0; indice -= 1) {
    const aleatorio = Math.floor(Math.random() * (indice + 1));
    [seleccion[indice], seleccion[aleatorio]] = [seleccion[aleatorio], seleccion[indice]];
  }

  if (!seleccion.length) {
    mostrarMensaje(contenido, 'No hay productos destacados disponibles.');
    carrusel.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach((control) => {
      control.hidden = true;
    });
    return;
  }

  const fragmento = document.createDocumentFragment();
  seleccion.slice(0, 3).forEach((producto, indice) => {
    const item = document.createElement('div');
    item.className = `carousel-item${indice === 0 ? ' active' : ''}`;

    const diapositiva = document.createElement('div');
    diapositiva.className = 'featured-slide';

    const imagen = document.createElement('img');
    imagen.className = 'featured-image';
    imagen.src = producto.image;
    imagen.alt = producto.title || 'Imagen del producto destacado';

    const detalles = document.createElement('div');
    const titulo = document.createElement('h3');
    titulo.className = 'featured-title';
    titulo.textContent = producto.title;

    const precio = document.createElement('p');
    precio.className = 'featured-price';
    precio.textContent = `$${Number(producto.price).toFixed(2)}`;

    detalles.append(titulo, precio, crearBotonDetalles(producto, 'Ver más detalles'));
    diapositiva.append(imagen, detalles);
    item.appendChild(diapositiva);
    fragmento.appendChild(item);
  });

  contenido.replaceChildren(fragmento);
  carrusel.querySelectorAll('.carousel-control-prev, .carousel-control-next').forEach((control) => {
    control.hidden = seleccion.length < 2;
  });
}

function agregarDetalle(contenedor, etiqueta, valor) {
  const parrafo = document.createElement('p');
  const titulo = document.createElement('strong');
  titulo.textContent = `${etiqueta}: `;
  const texto = document.createElement('span');
  texto.textContent = valor;
  parrafo.append(titulo, texto);
  contenedor.appendChild(parrafo);
}

async function mostrarDetalles(idProducto) {
  const modalElemento = document.getElementById('modalDetalles');
  const contenido = document.getElementById('modalDetallesContenido');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElemento);
  mostrarMensaje(contenido, 'Cargando detalles del producto…');
  modal.show();

  try {
    const respuesta = await fetch(`https://fakestoreapi.com/products/${encodeURIComponent(idProducto)}`);
    if (!respuesta.ok) {
      throw new Error(`La API respondió con el estado ${respuesta.status}.`);
    }

    const producto = await respuesta.json();
    if (!producto || typeof producto !== 'object' || !producto.id) {
      throw new Error('No se encontraron los detalles de este producto.');
    }

    const distribucion = document.createElement('div');
    distribucion.className = 'row g-4 align-items-center';
    const columnaImagen = document.createElement('div');
    columnaImagen.className = 'col-12 col-md-5';
    const imagen = document.createElement('img');
    imagen.className = 'modal-product-image';
    imagen.src = producto.image;
    imagen.alt = producto.title || 'Imagen del producto';
    columnaImagen.appendChild(imagen);

    const columnaDetalles = document.createElement('div');
    columnaDetalles.className = 'col-12 col-md-7';
    const titulo = document.createElement('h3');
    titulo.className = 'h4';
    titulo.textContent = producto.title;
    const descripcion = document.createElement('p');
    descripcion.textContent = producto.description;
    const precio = document.createElement('p');
    precio.className = 'h5 text-primary fw-bold';
    precio.textContent = `$${Number(producto.price).toFixed(2)}`;

    columnaDetalles.append(titulo, descripcion, precio);
    agregarDetalle(columnaDetalles, 'Categoría', producto.category || 'Sin categoría');
    if (producto.rating) {
      const calificacion = Number(producto.rating.rate);
      const cantidad = Number(producto.rating.count);
      agregarDetalle(
        columnaDetalles,
        'Calificación',
        `${Number.isFinite(calificacion) ? calificacion : 'N/A'} / 5 (${Number.isFinite(cantidad) ? cantidad : 0} reseñas)`
      );
    } else {
      agregarDetalle(columnaDetalles, 'Calificación', 'Sin calificaciones');
    }

    distribucion.append(columnaImagen, columnaDetalles);
    contenido.replaceChildren(distribucion);
  } catch (error) {
    console.error('No se pudieron cargar los detalles del producto:', error);
    mostrarMensaje(contenido, 'No se pudieron cargar los detalles. Inténtalo de nuevo más tarde.', 'danger');
  }
}

function inicializar() {
  const contenedores = ['catalogo-contenido', 'ofertas-contenido', 'carrusel'];
  contenedores.forEach((id) => {
    document.getElementById(id).addEventListener('click', (evento) => {
      const boton = evento.target.closest('[data-product-id]');
      if (boton) {
        mostrarDetalles(boton.dataset.productId);
      }
    });
  });

  obtenerProductos()
    .then((productos) => {
      mostrarCatalogo(productos);
      mostrarOfertas(productos);
      mostrarCarrusel(productos);
    })
    .catch(() => {
      const mensaje = 'No se pudieron cargar los productos. Comprueba tu conexión e inténtalo de nuevo.';
      contenedores.forEach((id) => {
        const elemento = document.getElementById(id);
        mostrarMensaje(elemento, mensaje, 'danger');
      });
    });
}

document.addEventListener('DOMContentLoaded', inicializar);