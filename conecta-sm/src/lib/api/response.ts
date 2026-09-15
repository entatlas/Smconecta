import { NextResponse } from 'next/server';

export function successResponse(data: any, message: string = "Operação realizada com sucesso", status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status });
}

export function errorResponse(code: string, message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message
    }
  }, { status });
}

// 204 No Content Helper
export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
