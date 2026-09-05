export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const earthRadiusMeters = 6371000;
    const toRadians = (degree) => degree * (Math.PI / 180);
    const latitude1 = toRadians(lat1);
    const latitude2 = toRadians(lat2);
    const deltaLatitude = toRadians(lat2 - lat1);
    const deltaLongitude = toRadians(lon2 - lon1);
    const a = Math.sin(deltaLatitude / 2) *
        Math.sin(deltaLatitude / 2) +
        Math.cos(latitude1) *
            Math.cos(latitude2) *
            Math.sin(deltaLongitude / 2) *
            Math.sin(deltaLongitude / 2);
    const c = 2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusMeters * c;
}
//# sourceMappingURL=distance.js.map