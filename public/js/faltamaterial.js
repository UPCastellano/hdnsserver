$(document).ready(function() {
    let table = $('#dataTable').DataTable({
        ajax: {
            url: '/api/faltamaterial',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'fecha' },
            { data: 'nivel' },
            { data: 'actividad' },
            { data: 'ubicacion' },
            { data: 'inicio' },
            { data: 'fin' },
            { data: 'impacto' },
            { data: 'observacion' },
            { data: 'usuario' },
            { data: 'etapas' },
            {
                data: null,
                render: function(data, type, row) {
                    return `
                        <div class="btn-container">
                            <button class="btn btn-secondary edit-btn" data-id="${row.id}"><i class="fas fa-edit"></i> Editar</button>
                            <button class="btn btn-danger delete-btn" data-id="${row.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                        </div>
                    `;
                }
            }
        ],
        dom: '<"btn-container"B>frtip',
        buttons: [
            {
                extend: 'copy',
                text: '<i class="fas fa-copy" style="color: #bccc2e;"></i> Copiar',
                className: 'btn btn-secondary'
            },
            {
                extend: 'csv',
                text: '<i class="fas fa-file-csv" style="color: #17a2b8;"></i> CSV',
                className: 'btn btn-info'
            },
            {
                extend: 'excel',
                text: '<i class="fas fa-file-excel" style="color: #28a745;"></i> Excel',
                className: 'btn btn-success'
            },
            {
                extend: 'pdf',
                text: '<i class="fas fa-file-pdf" style="color: #e74c3c;"></i> PDF',
                className: 'btn btn-danger'
            },
            {
                extend: 'print',
                text: '<i class="fas fa-print" style="color: #bccc2e;"></i> Imprimir',
                className: 'btn btn-secondary'
            }
        ],
        responsive: true,
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.24/i18n/Spanish.json',
            paginate: {
                first: 'Primero',
                last: 'Último',
                next: 'Siguiente',
                previous: 'Anterior'
            },
            lengthMenu: 'Mostrar _MENU_ registros por página',
            zeroRecords: 'No se encontraron resultados',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
            infoEmpty: 'Mostrando 0 a 0 de 0 registros',
            infoFiltered: '(filtrado de _MAX_ registros totales)',
            search: 'Buscar:'
        }
    });

    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const addBtn = document.getElementById('addBtn');
    const itemForm = document.getElementById('itemForm');

    addBtn.onclick = function() {
        openModal();
    }

    closeBtn.onclick = function() {
        closeModal();
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    itemForm.onsubmit = function(e) {
        e.preventDefault();
        const formData = {
            fecha: $('#fecha').val(),
            nivel: $('#nivel').val(),
            actividad: $('#actividad').val(),
            ubicacion: $('#ubicacion').val(),
            inicio: $('#inicio').val(),
            fin: $('#fin').val() || null ,
            impacto: $('#impacto').val(),
            observacion: $('#observacion').val(),
            usuario: $('#usuario').val(),
            etapas: $('#etapas').val()
        };

        const id = $('#id').val();
        if (id) {
            updateItem(id, formData);
        } else {
            createItem(formData);
        }
    }

    $('#dataTable').on('click', '.edit-btn', function() {
        const id = $(this).data('id');
        fetchItem(id);
    });

    $('#dataTable').on('click', '.delete-btn', function() {
        const id = $(this).data('id');
        if (confirm('¿Está seguro de que desea eliminar este registro?')) {
            deleteItem(id);
        }
    });

    function openModal(data = null) {
        if (data) {
            $('#modalTitle').text('Editar falta de material');
            $('#id').val(data.id);
            $('#fecha').val(data.fecha);
            $('#nivel').val(data.nivel);
            $('#actividad').val(data.actividad);
            $('#ubicacion').val(data.ubicacion);
            $('#inicio').val(data.inicio);
            $('#fin').val(data.fin);
            $('#impacto').val(data.impacto);
            $('#observacion').val(data.observacion);
            $('#usuario').val(data.usuario);
            $('#etapas').val(data.etapas);
        } else {
            $('#modalTitle').text('Agregar falta de material');
            itemForm.reset();
            $('#id').val('');
        }
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function createItem(data) {
        $.ajax({
            url: '/api/faltamaterial',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                table.ajax.reload();
                closeModal();
            },
            error: function(err) {
                console.error('Error creating item:', err);
            }
        });
    }

    function fetchItem(id) {
        $.ajax({
            url: `/api/faltamaterial/${id}`,
            method: 'GET',
            success: function(response) {
                openModal(response);
            },
            error: function(err) {
                console.error('Error fetching item:', err);
            }
        });
    }

    function updateItem(id, data) {
        $.ajax({
            url: `/api/faltamaterial/${id}`,
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                table.ajax.reload();
                closeModal();
            },
            error: function(err) {
                console.error('Error updating item:', err);
            }
        });
    }

    function deleteItem(id) {
        $.ajax({
            url: `/api/faltamaterial/${id}`,
            method: 'DELETE',
            success: function(response) {
                table.ajax.reload();
            },
            error: function(err) {
                console.error('Error deleting item:', err);
            }
        });
    }
});