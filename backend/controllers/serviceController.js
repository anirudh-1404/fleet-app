import Service from "../models/Service.js";
import Vehicle from "../models/Vehicle.js";

export const getDueServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ serviceDate: 1 })
      .populate("vehicle", "registration fleetNumber vehicleType make model");
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching due services" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "vehicle",
      "registration fleetNumber vehicleType make model"
    );
    if (!service) return res.status(404).json({ message: "Service record not found" });
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching service record" });
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const service = await Service.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      "vehicle",
      "registration fleetNumber vehicleType make model"
    );
    if (!service) return res.status(404).json({ message: "Service record not found" });
    return res.json(service);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating service status" });
  }
};
