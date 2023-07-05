/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */

import { Package } from "../models/Package.model";
import { calculateDistanceUsingDirectionsAPI } from "../utils/googleApiDistance.utils";
import { APIError } from "../utils/error.utils";
import { PackageRequestBody } from "../types/package.types";

class PackageService {
  static async createPackage(packageBody: PackageRequestBody) {
    const newPackage = await new Package(packageBody).save();

    if (!newPackage) {
      throw new APIError({
        message: "Error with creating a package",
        status: 404,
      });
    }

    return newPackage;
  }

  static async getPackageById(_id: string) {
    return await Package.findById(_id);
  }

  static getHistoryByDate(_date: string) {}

  static async updatePackageById(packageBody: Package) {
    const updatedPackage = await Package.findByIdAndUpdate(
      { _id: packageBody._id },
      packageBody,
      {
        new: true,
      }
    )
      .select("-salt -password")
      .exec();

    if (!updatedPackage) {
      throw new APIError({
        message: "User not found",
        status: 404,
      });
    }

    return updatedPackage.toObject();
  }

  static deletePackageById() {}

  static searchPackages() {}

  static getAvailablePackages() {}

  static async getAvailablePackagesByCurrentLocation(
    userLatitude: number,
    userLongitude: number
  ) {
    const packages = await Package.find({ status: null });

    const coordinates = packages.map((_package) => _package.coordinates);

    try {
      const distances = await Promise.all(
        coordinates.map((coordinate) => {
          if (coordinate) {
            return calculateDistanceUsingDirectionsAPI(
              userLatitude,
              userLongitude,
              coordinate.lat,
              coordinate.lng
            );
          }
          return null;
        })
      );
      const packagesWithDistance = packages.map((_package, index) => ({
        ..._package.toObject(),
        distance: distances[index],
      }));

      packagesWithDistance.sort((a, b) => {
        const distanceA = a.distance || 0;
        const distanceB = b.distance || 0;
        return distanceA - distanceB;
      });

      return packagesWithDistance;
    } catch (error) {
      throw new APIError({
        message: "Error occurred during distance calculation",
        status: 404,
      });
    }
  }
}

export { PackageService };
