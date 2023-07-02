/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-empty-function */
import { generateToken } from "../config/jwt/tokens";
import { User } from "../models/User";
import { ExtendedUserRequestBody } from "../controllers/user.controller";

// TODO Remove "_" from unused parameters
class UserService {
  static createUser() {}

  static async getUserById(_id: string) {
    const user = await User.findById(_id).select("-salt -password");
    return user;
  }

  static getDeliveryPeople() {}

  static async updateUserById(userBody: ExtendedUserRequestBody) {
    const foundUser = await User.findByIdAndUpdate(
      { _id: userBody._id },
      userBody,
      {
        new: true,
      }
    ).select("-salt -password");

    if (!foundUser) {
      throw new Error("User not found");
    }

    const token = generateToken(foundUser._id);

    if (!token) {
      throw new Error("Failed to generate token");
    }

    return { token, foundUser };
  }

  static async deleteUserById(id: string) {
    const foundUser = await User.findByIdAndUpdate(
      { _id: id },
      { is_deleted: true },
      { new: true }
    );

    if (!foundUser) {
      throw new Error("User not found");
    }

    return "";
  }

  static takePackage() {}

  static startDelivery() {}

  static finishDelivery() {}

  static cancelDelivery() {}
}

export { UserService };
