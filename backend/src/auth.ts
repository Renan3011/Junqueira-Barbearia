import { SignJWT, jwtVerify } from "jose";
const key=()=>new TextEncoder().encode(process.env.SESSION_SECRET || "unsafe-development-secret-change-me");
export const signSession=(id:string)=>new SignJWT({role:"admin"}).setProtectedHeader({alg:"HS256"}).setSubject(id).setIssuedAt().setExpirationTime("8h").sign(key());
export async function session(token?:string){if(!token)return null;try{return (await jwtVerify(token,key())).payload.sub??null}catch{return null}}
