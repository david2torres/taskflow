# Taskflow

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.15.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Technical Questions

1. ¿Cómo manejarías el refresh token en una integración real con Azure AD B2C?:
    Utilizando los flujos MSAL/OAuth y manteniendo los tokens en memoria siempre que se posible mediante el uso centralizado del interceptor, en caso de un error 401,  intentar hacer una renovacion Silenciosa (Manejando single-flight para evitar refresh repetitivos ) del token y en caso que no se logre, enviar al inicio de sesion.
2. ¿Qué estrategia usarías para cachear las respuestas de la API de tareas?:
    Utilizando SignalStore y shareReplay para la optencion de datos.
    A nivel de front, otra estrategia podria ser el manejo de almacenamiento mediante serviceWorker
3. ¿Cómo implementarías Server-Side Rendering (SSR) en esta aplicación y qué beneficios traería?:
    - Habilitar SSR en el proyecto Angular
    - Activaría el soporte de Server-Side Rendering usando la solución oficial de Angular (Angular 19 ya incluye soporte para SSR + hydration).
    - Esto genera un servidor Node que renderiza la primera vista en el servidor y luego el navegador “hidrata” la aplicación para continuar como SPA.
    - Asegurar que el routing y el lazy loading funcionen correctamente
    - Las rutas con loadComponent funcionan bien con SSR: el servidor renderiza la ruta solicitada inicialmente.
    - Para rutas protegidas como /dashboard, el servidor debe decidir qué renderizar cuando no existe una sesión válida.
    - Hacer el fetch inicial de datos en el servidor
    - Cuando el usuario está autenticado, el servidor puede ejecutar el GET /todos durante el render SSR.
    - El HTML resultante ya contiene la lista de tareas y el navegador solo se encarga de hidratar la aplicación.
    - Manejo de autenticación en SSR
    - En SSR no existe localStorage, por lo que no se puede depender de él.
    - En un escenario real de producción:
    - El token debería almacenarse en cookies httpOnly o manejarse mediante sesión server-side.
    - Para esta prueba técnica (token simulado):
    - El SSR puede renderizar siempre /login si no hay sesión visible desde el servidor.
    - El dashboard puede quedar completamente manejado del lado del cliente una vez que el usuario inicia sesión.
    - El guard y el interceptor deben evitar acceder a APIs del navegador cuando se ejecutan en el servidor.
    - Proteger el uso de APIs del navegador
    - Cualquier acceso a window, document, localStorage debe protegerse usando:
    - isPlatformBrowser() o inyección de PLATFORM_ID, o
    - Un StorageService que en el servidor actúe como “no-op” y en el navegador use localStorage.

    Beneficios concretos para esta aplicación

    - Mejor tiempo de primera carga (TTFB y LCP percibidos)
    - Mejor experiencia en redes lentas o dispositivos de bajo rendimiento
    - Deep links consistentes con estado por URL
    - SEO para rutas públicas (si existieran)
