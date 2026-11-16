$(function () {

    $('#conferirBtn').on('click', async () => {

        let msg = 'jQuery e API funcionam!';
        let stts = 'text-success';

        const resultado = await $.ajax({
            url: '/api/ping',
            method: 'GET',
            dataType: 'json',
            timeout: 5000,
        });

        console.log(resultado?.status);

        if(resultado?.status !== 'ok') {
            msg = 'jQuery funciona, mas a API falhou!';
            stts = 'text-success';
        }

        $('#mensagem')
            .removeClass('text-muted text-success text-danger')
            .text(msg)            
            .addClass(stts);
    });
});
