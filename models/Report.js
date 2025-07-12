import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    CodeSort: { type: String, default: "" },
    Acct: { type: String, default: "" },
    Date: { type: Date, default: Date.now },
    OperTypeInvisible: { type: String, default: "" },
    Code: { type: String, default: "" },
    ItemID: { type: String, default: "" },
    GoodName: { type: String, default: "" },
    ItemGroupCode: { type: String, default: "" },
    GroupName: { type: String, default: "" },
    PartnerID: { type: String, default: "" },
    Partner: { type: String, default: "" },
    PartnerGroupCode: { type: String, default: "" },
    PartnerGroupName: { type: String, default: "" },
    LocationID: { type: String, default: "" },
    Object: { type: String, default: "" },
    OperatorID: { type: String, default: "" },
    UserName: { type: String, default: "" },
    Qtty: { type: Number, default: 0 },
    Measure1: { type: String, default: "" },
    PriceIN: { type: Number, default: 0 },
    VATIn1: { type: Number, default: 0 },
    deliverysum: { type: Number, default: 0 },
    VATIn: { type: Number, default: 0 },
    BG: { type: String, default: "" },
    IsTotal: { type: Number, default: 0 },
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
