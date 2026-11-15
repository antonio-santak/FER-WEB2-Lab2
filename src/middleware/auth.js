export function requireLogin(req, res, next) {
    if(!req.session.user_id) 
        return res.status(401).send({message: "Potrebna prijava!"});
    next();
}

export function requireRole(role) {
    return (req, res, next) => {
        if(req.session.role !== role) 
            return res.status(403).send({message: "Nemate pravo pristupa resursu!"});
        next();
    };
}