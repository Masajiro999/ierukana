(function () {
    $(function () {
        setLang('ja');

        $('#lang').on('change', function () {
            var lang = $('#lang').val();
            setLang(lang);
        });
    });

    function setLang(lang) {
        log('lang=' + lang);

        i18next.use(i18nextXHRBackend).init({
            backend: {
                loadPath: 'locales/{{lng}}/string.json'
            },
            debug: false,
            defaultLng: 'ja',
            fallbackLng: false,
            lng: lang,
        }, function (err, t) {
            jqueryI18next.init(i18next, $);
            $('[data-i18n]').localize();
        });
        ImasCg.Ierukana.changeLang(lang);
    }

})();
