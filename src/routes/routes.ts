import contactRoutes from "./contactAssociation.route.js";

const baseURL = "/v1/user/listing";

const routes = (app:any)=>{
    app.use(`${baseURL}`, contactRoutes);
};

export default routes;