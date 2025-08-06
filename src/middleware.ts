import { NextResponse, NextRequest } from "next/server";
import { PATH } from "./constants/path";
import { ACCESS_TOKEN } from "@/constants/token";

const AUTH_PATHS = [PATH.LOGIN, PATH.REGISTER];
const PRIVATE_PATHS = [
  PATH.HOME,
  PATH.CATEGORY,
  PATH.PRODUCT,
  PATH.CREATE_CATEGORY,
  PATH.CREATE_PRODUCT,
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const { pathname } = request.nextUrl;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url));
  }

  if (!token && PRIVATE_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url));
  }

  if (token && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
