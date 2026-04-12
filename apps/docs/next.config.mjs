/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// 모노레포의 워크스페이스 패키지를 트랜스파일
	transpilePackages: ['@kalyx/react', '@kalyx/core'],
	experimental: {
		// 워크스페이스 의존성 추적
		externalDir: true,
	},
};

export default nextConfig;
