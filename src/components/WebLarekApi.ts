import { IOrderInfo, IOrderResult, IProduct } from "../types";
import { Api, ApiListResponse } from "./base/api";

export interface IWebLarekApi {
    getProducts(): Promise<IProduct[]>;

}

export class WebLarekApi extends Api implements IWebLarekApi{
    readonly cdn: string;
    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProducts(): Promise<IProduct[]> {
        return this.get("/product/").then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image.replace(".svg", ".png")
            }))
        );
    }

    postOrder(order: IOrderInfo): Promise<IOrderResult>{
        return this.post("/order", order).then((data: IOrderResult) => data);
    }
}