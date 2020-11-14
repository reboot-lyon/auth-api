db.disableFreeMonitoring();
db.createUser({
    user: 'root',
    pwd: 'root',
    roles: [
        {
            role: '',
            db: ''
        }
    ]
});