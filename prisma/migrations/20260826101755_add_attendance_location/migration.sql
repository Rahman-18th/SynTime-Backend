-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "check_in_distance_meters" DECIMAL(10,2),
ADD COLUMN     "check_in_latitude" DECIMAL(10,7),
ADD COLUMN     "check_in_longitude" DECIMAL(10,7),
ADD COLUMN     "check_out_distance_meters" DECIMAL(10,2),
ADD COLUMN     "check_out_latitude" DECIMAL(10,7),
ADD COLUMN     "check_out_longitude" DECIMAL(10,7);
