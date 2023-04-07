let endpoint;

const hostname = window && window.location && window.location.hostname;

if (hostname === 'localhost')
    endpoint = "http://127.0.0.1:8000/api";
else
    endpoint = '/api';

export default {
    hostname,
    sign_in: endpoint + '/user-login',
    sign_up: endpoint + '/user-signup',

    add_folder: endpoint + '/add-folder',
    get_folder: endpoint + '/fetch-folder/',
    get_single_folder: endpoint + '/fetch-single-folder/',
    delete_folder: endpoint + '/delete-folder/',
    edit_folder: endpoint + '/edit-folder',

    add_vault: endpoint + '/add-vault',
    get_vault: endpoint + '/fetch-vault/',
    get_single_vault: endpoint + '/fetch-single-vault/',
    delete_vault: endpoint + '/delete-vault/',
    edit_vault: endpoint + '/edit-vault',
    export_vault: endpoint + '/export-vault/',
    import_vault: endpoint + '/import-vault',

}
