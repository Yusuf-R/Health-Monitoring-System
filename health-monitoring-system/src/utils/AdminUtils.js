import {axiosPrivate, axiosPublic} from "@/utils/AxiosInstance";
import {healthWorkerDataStore, stakeholderDataStore, userDataStore} from "@/store/profileDataStore"
import nacl from "tweetnacl";
import {decodeBase64, decodeUTF8, encodeBase64} from "tweetnacl-util";

const publicKeyBase64 = process.env.NEXT_PUBLIC_TWEETNACL_PUBLIC_KEY;

class AdminUtils {

    // to be used for Registration. Login and SetPassword Specific operations
    static async encryptCredentials(data) {
        const publicKeyPem = process.env.NEXT_PUBLIC_ENCRYPTION_PUBLIC_KEY;

        function pemToArrayBuffer(pem) {
            const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n|\r/g, '');
            const binary = window.atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes.buffer;
        }

        // Serialize the data properly
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(jsonString);

        try {
            const publicKeyBuffer = pemToArrayBuffer(publicKeyPem);
            const importedKey = await window.crypto.subtle.importKey(
                "spki",
                publicKeyBuffer, {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                false, ["encrypt"]
            );

            const encryptedData = await window.crypto.subtle.encrypt({
                    name: "RSA-OAEP"
                },
                importedKey,
                dataBuffer
            );
            return btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedData)));
        } catch (error) {
            console.error("Encryption error:", error);
            throw error;
        }
    }

    // Encrypt data using the PEM public key stored as an environment variable
    static async encryptDataWithTweetNaCl(data) {
        const publicKey = decodeBase64(publicKeyBase64);
        const messageUint8 = decodeUTF8(JSON.stringify(data));

        // Generate a nonce for encryption
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const encryptedMessage = nacl.box(messageUint8, nonce, publicKey, nacl.box.keyPair().secretKey);

        return {
            encryptedMessage: encodeBase64(encryptedMessage),
            nonce: encodeBase64(nonce),
        };

    }

    static async dataDecryption(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/user/decrypt',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async encryptAndStoreProfile(profileData) {
        try {
            const encryptedData = await AdminUtils.encryptDataWithTweetNaCl(profileData, publicKeyBase64);
            if (profileData.role === 'User') {
                userDataStore.getState().setEncryptedUserData(encryptedData);
            } else if (profileData.role === 'HealthWorker') {
                healthWorkerDataStore.getState().setEncryptedHealthWorkerData(encryptedData);
            } else if (profileData.role === 'StakeHolder') {
                stakeholderDataStore.getState().setEncryptedStakeHolderData(encryptedData);
            }
            return;
        } catch (error) {
            console.error("Failed to encrypt and store data with TweetNaCl:", error);
        }
    }


    // Api for User Objects

    static async userRegistration(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/user/register',
                data: obj,
            });
            if (response.status === 201) {
                return response.data.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async userLogin(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/user/login',
                data: obj,
            });
            if (response.status === 201) {
                return response.data.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async userLogout() {
        try {
            const response = await axiosPrivate({
                method: "POST",
                url: '/user/logout',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async userProfile() {
        try {
            const response = await axiosPrivate({
                method: "GET",
                url: '/user/profile',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async updateUserProfile(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/user/profile/update',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async userAvatar(formData) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/user/profile/avatar',
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                // Add this to properly handle the FormData
                transformRequest: [function (data) {
                    return data;
                }],
            });

            if (response.status === 201) {
                return response.data;
            } else {
                console.error('Upload response:', response);
                throw new Error(response.data?.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    static async setUserLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/user/profile/location/set',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async deleteUserLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "DELETE",
                url: '/user/profile/location/delete',
                data: obj,
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async editUserLocation(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/user/profile/location/edit',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    // Medical History
    static async createMedicalHistoryRecord(obj) {
        try {
            const response = await axiosPrivate({
                method: "POST",
                url: '/user/medical-history/create',
                data: obj,
            });
            if (response.status === 201) {
                return response.data;
            } else {
                return new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async getMedicalHistoryRecord() {
        try {
            const response = await axiosPrivate({
                method: "GET",
                url: '/user/medical-history/get',
            });
            if (response.status === 200) {
                return response.data.data;
            } else {
                return new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async updateMedicalHistoryRecord(obj) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/user/medical-history/update',
                data: obj,
            });
            if (response.status === 201) {
                return response.data.data;
            } else {
                return new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }


    // health worker section


    static async healthWorkerRegistration(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/health-worker/register',
                data: obj,
            });
            if (response.status === 201) {
                return response.data.data;
            } else {
                throw new Error(response?.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async healthWorkerLogin(obj) {
        try {
            const response = await axiosPublic({
                method: "POST",
                url: '/health-worker/login',
                data: obj,
            });
            if (response.status === 201) {
                return response.data.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async healthWorkerLogout() {
        try {
            const response = await axiosPrivate({
                method: "POST",
                url: '/health-worker/logout',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async healthWorkerProfile() {
        try {
            const response = await axiosPrivate({
                method: "GET",
                url: '/health-worker/profile',
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.log({error});
            throw new Error(error);
        }
    }

    static async healthWorkerAvatar(formData) {
        try {
            const response = await axiosPrivate({
                method: "PATCH",
                url: '/health-worker/profile/avatar',
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                // Add this to properly handle the FormData
                transformRequest: [function (data) {
                    return data;
                }],
            });

            if (response.status === 201) {
                return response.data;
            } else {
                console.error('Upload response:', response);
                return new Error(response.data?.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }


}

export default AdminUtils;