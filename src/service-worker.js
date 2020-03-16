// manifest import and workbox imports will be autogenerated by webpack
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

fetch('/').then(() => {
    console.log('App Initialized...V1.0RC9');
});

fetch('/manifest.json',{cache: "no-store"}).then((Response) => {
    Response.json().then((value) => {
        if("1.0RC9"< value.version)
        {
            window.app.f7.toast.create({text: 'Updates Available', closeTimeout: 2000,}).open();
        }
    });
})