var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // alert('bindEvents!');
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('main');
        app.includeSidebar();
        // app.dataBaseInit();
        // app.onPageChange();
        // alert('onDeviceReady!');
        $(document).on("pagecontainerbeforeload", function(){
            app.beforePageChanges();
        });
        $(document).on("pagecontainerload", function(){
            app.onPageChanged();
        });
        $(document).on("pagecreate", function(){
            app.pageCreated();
        });
        $(document).on("pageload", function(){
            app.pageLoaded();
        });
        $(document).on("pageshow", function(){
            var thisActivePage = $.mobile.activePage.attr("id");
            app.pageShowed(thisActivePage);
        });
        $(document).on('vmousedown click', '.prevented',function(event){
            event.preventDefault();
            /*alert( $(this).attr('id') );
            $.mobile.loadPage( "../resources/us.html");*/
            var thisID = $(this).attr('id');
            // alert(thisID);
            app.viewEntry( thisID );
            // return false;
        });

        $(document).on('vmousedown click', '.expense',function(event){
            event.preventDefault();
            /*alert( $(this).attr('id') );
            $.mobile.loadPage( "../resources/us.html");*/
            var thisID = $(this).attr('id');
            // alert(thisID);
            app.viewEntry( thisID );
            // return false;
        });
        $(document).on('vmousedown click change', '.unique-checkbox input[type=checkbox]', app.uniqueCheckbox );
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        /*var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received'); 
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');*/

        var listeningElement = $('.listening');
        var receivedElement = $('.received');

        listeningElement.css( 'display', 'none' );
        receivedElement.css( 'display', 'block' );

        /*console.log('Received Event: ' + id);
        console.log('listeningElement : ' + listeningElement);
        console.log('receivedElement : ' + receivedElement);*/
    },
    includeSidebar: function() {
        $.get('sidebar.html', function( sidebar ) {
            $.mobile.pageContainer.before(sidebar);
            $("#sidebar").panel();
        });
    },
    dataBaseInit: function() {
        //First, open our db
        dbShell = window.openDatabase("ConcalcsDatabase", 2, "ConcalcsDatabase", 1000000);
        //run transaction to create initial tables
        dbShell.transaction(app.setupTable, app.dbErrorHandler, app.getExpenses);
        dbShell.transaction(app.setupCategoryTable, app.dbErrorHandler, app.getExpenses);
    },
    //I just create our initial table - all one of em
    setupTable: function(tx){
        var sqlCreateTable   = "CREATE TABLE IF NOT EXISTS npd_expenses (";
        sqlCreateTable      +=      "id INTEGER PRIMARY KEY AUTOINCREMENT,";
        sqlCreateTable      +=      "title,";
        sqlCreateTable      +=      "body,";
        sqlCreateTable      +=      "value INTEGER,";
        sqlCreateTable      +=      "payment_date DATETIME,";
        sqlCreateTable      +=      "hour TIME,";
        sqlCreateTable      +=      "status BOOLEAN,";
        sqlCreateTable      +=      "fix_expense BOOLEAN,";
        sqlCreateTable      +=      "parcel_expense BOOLEAN,";
        sqlCreateTable      +=      "parcels_number INTEGER";
        sqlCreateTable      += ")";

        tx.executeSql(sqlCreateTable);
    },
    setupCategoryTable: function(tx){
        var sqlCreateCategoryTable   = "CREATE TABLE IF NOT EXISTS npd_categories (";
        sqlCreateCategoryTable      +=      "cat_id INTEGER PRIMARY KEY AUTOINCREMENT,";
        sqlCreateCategoryTable      +=      "title,"
        sqlCreateCategoryTable      += ")";

        tx.executeSql(sqlCreateCategoryTable);
    },
    dbErrorHandler: function(err){
        alert("DB Error: " + err.message + "\nCode=" + err.code);
    },
    getEntry: function(id){
        dbShell.transaction(function(tx) {
            tx.executeSql("SELECT * FROM npd_expenses WHERE id = ?", [id], app.renderEntry);
        }, app.dbErrorHandler);
    },
    getExpenses: function() {
        dbShell.transaction(function(tx) {
            tx.executeSql("SELECT * FROM npd_expenses", [], app.renderEntries);
        }, app.dbErrorHandler);
    },
    editExpense: function(id){
        dbShell = window.openDatabase("ConcalcsDatabase", 2, "ConcalcsDatabase", 1000000);
        dbShell.transaction(function(tx) {
            tx.executeSql("SELECT * FROM npd_expenses WHERE id = ?", [id], function(tx,results){

                for(var i = 0; i < results.rows.length; i++ ) {
                    $('#title').val( results.rows.item(i).title );
                    $('#value').val( results.rows.item(i).value );
                    $('#payment_date').val( results.rows.item(i).payment_date );
                    $('#hour').val( results.rows.item(i).hour );
                    $('#body').val( results.rows.item(i).body );


                   /* function refreshCheckbox (theCheckbox, checkboxStatus){
                        // alert(theCheckbox + ' stats: ' + checkboxStatus);
                        var $checkbox = $(theCheckbox);
                        var $label = $checkbox.prev();

                        if(checkboxStatus == 'true'){
                            $label.removeClass("ui-checkbox-off");
                            $label.addClass("ui-checkbox-on");
                            $(theCheckbox).attr('data-cacheval', true);
                            // $(theCheckbox).prop( 'checked', true ).checkboxradio('refresh');
                        }else{
                            $label.removeClass("ui-checkbox-on");
                            $label.addClass("ui-checkbox-off");
                            $(theCheckbox).attr('data-cacheval', false);
                            // $(theCheckbox).prop( 'checked', false ).checkboxradio('refresh');
                        }
                    }*/

                    $('#status').prop( 'checked', results.rows.item(i).status );
                    $('#fix-expense').prop( 'checked', results.rows.item(i).fix_expense );
                    $('#parcel-expense').prop( 'checked', results.rows.item(i).parcel_expense );

                    /*refreshCheckbox('#status', results.rows.item(i).status);
                    refreshCheckbox('#fix-expense', results.rows.item(i).fix_expense);
                    refreshCheckbox('#parcel-expense', results.rows.item(i).parcel_expense);*/
                    // $('#status').checkboxradio().trigger('create')
                    setTimeout(function() {
                        $('input[type=checkbox]').checkboxradio().checkboxradio('refresh');
                    }, 1000);

                    /*$('#status').prop( 'checked', results.rows.item(i).status ).checkboxradio('refresh');
                    $('#fix-expense').prop( 'checked', results.rows.item(i).fix_expense ).checkboxradio('refresh');
                    $('#parcel-expense').prop( 'checked', results.rows.item(i).parcel_expense ).checkboxradio('refresh');*/

                    /*$('#status').prop( 'checked', results.rows.item(i).status );
                    $('#fix-expense').prop( 'checked', results.rows.item(i).fix_expense );
                    $('#parcel-expense').prop( 'checked', results.rows.item(i).parcel_expense );*/

                    $('#parcels-number').val( results.rows.item(i).parcels_number );
                }
            });
        }, app.dbErrorHandler);
    },
    renderEntry: function(tx,results){
        var singleEntry = "";
        for(var i = 0; i < results.rows.length; i++ ) {
            // entry += "<h1><a href='edit.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).title + "</a></li>";
            singleEntry += "<h3>#<span class='this-entry-id'>" + results.rows.item(i).id + "<span> " + results.rows.item(i).title + "</h3>";
            singleEntry += "<p>R$ " + results.rows.item(i).value + "</p>";
            singleEntry += "<p>" + app.dateFormated(results.rows.item(i).payment_date) + " às " + results.rows.item(i).hour + "</p>";
            singleEntry += "<p>" + results.rows.item(i).body + "</p>";
        }
        $("#single-entry").html(singleEntry);
        // $("#noteTitleList").listview("refresh");
    },
    renderEntries: function(tx,results){
        if (results.rows.length == 0) {
            $("#wrapper").html("<p>You currently do not have any npd_expenses.</p>");
        } else {
            var entry = "";

            for(var i = 0; i < results.rows.length; i++ ) {
                // entry += "<li><a href='view-expense.html?id="+results.rows.item(i).id + "'>" + results.rows.item(i).title + "</a></li>";
                entry += '<li class="expense-entry status">';
                entry +=    '<a href="view-expense.html?id= ' + results.rows.item(i).id + '">';
                entry +=        '<div class="entry-info col-1">';
                entry +=            '<h4>' + results.rows.item(i).title + '</h4>';
                entry +=            '<p class="date">' + app.dateFormated(results.rows.item(i).payment_date) + '</p>';
                entry +=        '</div>';
                entry +=        '<div class="entry-info col-2">';
                entry +=            '<p class="value">R$ ' + results.rows.item(i).value + '</p>';
                entry +=            '<p class="status">Não foi pago</p>';
                entry +=        '</div>';
                entry +=    '</a>';
                entry += '</li>';
            }
            $("#noteTitleList").html(entry);
            $("#noteTitleList").listview("refresh");
        }
    },
    saveEntry: function() {
        // alert('saveEntry');
        dbShell = window.openDatabase("ConcalcsDatabase", 2, "ConcalcsDatabase", 1000000);

        var checkIfEditing = app.getParameterByName('edit');
        var id = app.getParameterByName('id');
        if (checkIfEditing) {
            var title = $('#title').val();
            var value = $('#value').val();
            var payment_date = $('#payment_date').val();
            var hour = $('#hour').val();
            var body = $('#body').val();
            var status = $('#status').prop( "checked" );
            var fix_expense = $('#fix-expense').prop( "checked" );
            var parcel_expense = $('#parcel-expense').prop( "checked" );
            var parcels_number = $('#parcels-number').val();

            dbShell.transaction(function(tx) {
                var sqlUpdate   = "UPDATE npd_expenses SET ";
                sqlUpdate      +=      "title=?,";
                sqlUpdate      +=      "value=?,";
                sqlUpdate      +=      "payment_date=?,";
                sqlUpdate      +=      "hour=?,";
                sqlUpdate      +=      "body=?";
                sqlUpdate      += "WHERE id=?";
                tx.executeSql(sqlUpdate, [ title, value, payment_date, hour, body, id ] );

                $.mobile.changePage('index.html');

            }, app.dbErrorHandler);
        }else{
            var title = $('#title').val();
            var value = $('#value').val();
            var payment_date = $('#payment_date').val();
            var hour = $('#hour').val();
            var body = $('#body').val();
            var status = $('#status').prop( "checked" );
            var fix_expense = $('#fix-expense').prop( "checked" );
            var parcel_expense = $('#parcel-expense').prop( "checked" );
            var parcels_number = $('#parcel-slider').val();

            /*alert('title ' + title);
            alert('value ' + value);
            alert('payment_date ' + payment_date);
            alert('hour ' + hour);
            alert('body ' + body);
            alert('status ' + status);
            alert('fix_expense ' + fix_expense);
            alert('parcel_expense ' + parcel_expense);
            alert('parcels_number ' + parcels_number);*/

            dbShell.transaction(function(tx) {
                var sqlInsert   = "INSERT INTO npd_expenses (";
                sqlInsert      +=      "title,";
                sqlInsert      +=      "value,";
                sqlInsert      +=      "payment_date,";
                sqlInsert      +=      "hour,";
                sqlInsert      +=      "body,";
                sqlInsert      +=      "status,";
                sqlInsert      +=      "fix_expense,";
                sqlInsert      +=      "parcel_expense,";
                sqlInsert      +=      "parcels_number";
                sqlInsert      += ") VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )";
                tx.executeSql(sqlInsert, [ title, value, payment_date, hour, body, status, fix_expense, parcel_expense, parcels_number] );

                $.mobile.changePage('index.html');

            }, app.dbErrorHandler);
        }
    },
    // Triggered after the page has been successfully loaded and inserted into the DOM
    onPageChanged: function() {
       
    },
    // Triggered before any page load request is made
    beforePageChanges: function() {
      
    },
    // Triggered when the page has been created in the DOM (via ajax or other) and after all widgets have had an opportunity to enhance the contained markup.
    pageCreated: function() {
        
    },  
    // Triggered after the page is successfully loaded and inserted into the DOM.
    pageLoaded: function() {

    },
    // Triggered on the "toPage" after the transition animation has completed
    pageShowed: function(thisActivePage) {
        // alert('Page: ' + thisActivePage);
        if( thisActivePage == "main" ){
            app.initChart();
        }else if( thisActivePage == "list" ){
            // alert('is list.html');
            app.dataBaseInit();
        }else if( thisActivePage == "view-expense" ){
            app.viewEntry();

        }else if( thisActivePage == "expense" ){
            var edit = app.getParameterByName('edit');
            var id = '';
            if(edit){
                id = app.getParameterByName('id');
                app.editExpense(id);
            }
        }
    },
    getParameterByName: function(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },
    viewEntry: function() {
        var id = app.getParameterByName('id');
        app.getEntry(id);
    },
    goBackBtn: function(){
        $.mobile.back();
        // window.history.back();
    },
    editID: function(){
        var thisID = app.getParameterByName('id');
        $.mobile.changePage('expense.html', {
            data: {
                edit: true,
                id: thisID
            }
        });
    },
    deleteID: function(){
        var thisID = app.getParameterByName('id');
        $.mobile.changePage('delete.html', {
            data: {
                id: thisID
            }
        });
    },
    deleteEntryID: function(){
        var id = app.getParameterByName('id');
        dbShell = window.openDatabase("ConcalcsDatabase", 2, "ConcalcsDatabase", 1000000);
        dbShell.transaction(function(tx) {
            tx.executeSql("DELETE FROM npd_expenses WHERE id = ?", [id] );

            $.mobile.changePage( "index.html");

        }, app.dbErrorHandler);;
    },
    formCheckboxParcel: function() {
        var label = $('.parcel-expense-label');
        if( label.hasClass('ui-checkbox-on') ){
            $('.parcel-range').addClass('inactive');
            console.log('inactive');
        }else{
            $('.parcel-range').removeClass('inactive');
            console.log('active');
        };
    },
    dateFormated: function(unformatedDate) {
        var date = new Date(unformatedDate);
        date.setDate(date.getDate() + 1);
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        // document.write(year + '-' + month + '-' + day);
        return (day + '/' + month + '/' + year);
    },
    uniqueCheckbox: function(){
        $('.unique-checkbox input[type=checkbox]').attr('data-cacheval', 'true').not(this).prop( 'checked', false).attr('data-cacheval', 'false').checkboxradio('refresh');
        app.formCheckboxParcel();
    },
    initChart: function() {
        
        $('#overview-chart').highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Visão geral das despeas'
            },
            xAxis: {
                categories: ['Dezembro', 'Janeiro', 'Feveriro']
            },
            yAxis: {
                title: {
                    text: 'Total'
                }
            },
            series: [{
                name: 'Despesas',
                data: [1280, 2950, 304]
            }, {
                name: 'Receitas',
                data: [1505, 700, 3051]
            }]
        });
    },
};