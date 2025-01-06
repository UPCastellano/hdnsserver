$(document).ready(function() {
    let table = $('#dataTable').DataTable({
        ajax: {
            url: '/api/Retrabajos',
            type: "GET",
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'fecha' },
            { data: 'nivel' },
            { data: 'actividad' },
            {
                data: 'ubicacion',
                render: function(data) {
                    switch(data) {
                        case 'A': return 'Edificio A';
                        case 'B': return 'Edificio B';
                        case 'C': return 'Edificio C';
                        case 'D': return 'Edificio D';
                        case 'E': return 'Edificio E';
                        case 'F': return 'Edificio F';
                        case 'G': return 'Edificio G';
                        default: return data; // Devolver el valor original si no es un edificio conocido
                    }
                }
            },
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
        createdRow: function(row, data, dataIndex) {
            if (data.impacto > 5) {
                $(row).addClass('table-row-danger'); // Si el impacto es mayor a 5, color rojo
            } else if (data.impacto > 2) {
                $(row).addClass('table-row-warning'); // Si el impacto es mayor a 2, color amarillo
            } else {
                $(row).addClass('table-row-success'); // Si el impacto es 2 o menor, color verde
            }
        },
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
        },
        columnDefs: [{
            targets: [1, 5, 6], // Ajusta estos índices según tus columnas de fecha
            render: function(data) {
                if (data) {
                    return moment(data).format('DD-MM-YYYY');
                }
                return '';
            }
        }]
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
            $('#modalTitle').text('Editar Retrabajo');
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
            $('#modalTitle').text('Agregar Retrabajo');
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
            url: '/api/Retrabajos',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                table.ajax.reload();
                closeModal();
            },
            error: function(err) {
                console.error('Error creating item:', err);
                console.log('Error details:', err.responseText);
            }
        });
    }

    function fetchItem(id) {
        $.ajax({
            url: `/api/Retrabajos/${id}`,
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
            url: `/api/Retrabajos/${id}`,
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
            url: `/api/Retrabajos/${id}`,
            method: 'DELETE',
            success: function(response) {
                table.ajax.reload();
            },
            error: function(err) {
                console.error('Error deleting item:', err);
            }
        });
    }

    $('#exportarPersonalizado').on('click', function() {
        console.log("Botón de exportación presionado"); // Para depuración
        var edificioSeleccionado = $('#filtroEdificioPersonalizado').val();
        var fechaDesde = $('#fechaDesde').val();
        var fechaHasta = $('#fechaHasta').val();
        
        var datos = table.rows().data().toArray();
        
        // Filtrar por edificio y rango de fechas
        var datosFiltrados = datos.filter(row => {
            var fecha = moment(row.fecha, ['DD-MM-YYYY', 'YYYY-MM-DD']);
            
            // Lógica de filtrado
            var cumpleEdificio = edificioSeleccionado === "" || // Si se selecciona "Todos los Edificios"
                (edificioSeleccionado === 'Edificio A' && (row.ubicacion === 'A' || row.ubicacion === 'Edificio A')) ||
                (edificioSeleccionado === 'Edificio B' && (row.ubicacion === 'B' || row.ubicacion === 'Edificio B')) ||
                (edificioSeleccionado === 'Edificio C' && (row.ubicacion === 'C' || row.ubicacion === 'Edificio C')) ||
                (edificioSeleccionado === 'Edificio D' && (row.ubicacion === 'D' || row.ubicacion === 'Edificio D')) ||
                (edificioSeleccionado === 'Edificio E' && (row.ubicacion === 'E' || row.ubicacion === 'Edificio E')) ||
                (edificioSeleccionado === 'Edificio F' && (row.ubicacion === 'F' || row.ubicacion === 'Edificio F')) ||
                (edificioSeleccionado === 'Edificio G' && (row.ubicacion === 'G' || row.ubicacion === 'Edificio G')) ||
                (edificioSeleccionado === 'Otros' && !['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(row.ubicacion));
            
            var cumpleFecha = (!fechaDesde || fecha.isSameOrAfter(moment(fechaDesde, ['DD-MM-YYYY', 'YYYY-MM-DD']))) && 
                              (!fechaHasta || fecha.isSameOrBefore(moment(fechaHasta, ['DD-MM-YYYY', 'YYYY-MM-DD'])));
            
            return cumpleEdificio && cumpleFecha;
        });

        // Crear un nuevo array con solo las columnas deseadas
        var datosExportar = datosFiltrados.map((row) => ({
            'ID': row.id,
            'Nivel': row.nivel,
            'Actividad': row.actividad,
            'Ubicación': row.ubicacion,
            'Inicio': moment(row.inicio, ['DD-MM-YYYY', 'YYYY-MM-DD']).format('DD-MM-YYYY'),
            'Fin': moment(row.fin, ['DD-MM-YYYY', 'YYYY-MM-DD']).format('DD-MM-YYYY'),
            'Impacto': row.impacto,
            'Observación': row.observacion
        }));

        // Verificar si hay datos para exportar
        if (datosExportar.length === 0) {
            alert('No hay datos para exportar con los filtros seleccionados.');
            return;
        }

        // Crear una hoja de Excel
        var wb = XLSX.utils.book_new();
        var wsData = [];
        var edificiosAgrupados = {}; // Objeto para agrupar datos por edificio

        // Agrupar datos por edificio
        datosExportar.forEach(row => {
            var edificio = row.Ubicación;
            if (!edificiosAgrupados[edificio]) {
                edificiosAgrupados[edificio] = [];
            }
            edificiosAgrupados[edificio].push(row);
        });

        // Agregar datos a la hoja de Excel
        for (var edificio in edificiosAgrupados) {
            // Agregar encabezado para el edificio
            wsData.push([`Datos para ${edificio}`]);
            wsData.push(['ID', 'Nivel', 'Actividad', 'Ubicación', 'Inicio', 'Fin', 'Impacto', 'Observación']); // Encabezados

            // Agregar los datos del edificio
            edificiosAgrupados[edificio].forEach(row => {
                wsData.push([row.ID, row.Nivel, row.Actividad, row.Ubicación, row.Inicio, row.Fin, row.Impacto, row.Observación]);
            });

            wsData.push([]); // Espacio entre grupos de edificios
        }

        // Convertir los datos a una hoja de Excel
        var ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Agrupado');

        var fecha = moment().format('DD-MM-YYYY');
        var nombreArchivo = `Reporte_Retrabajos_${edificioSeleccionado || 'Todos'}_${fecha}.xlsx`;
        
        // Escribir el archivo
        XLSX.writeFile(wb, nombreArchivo);
    });
});