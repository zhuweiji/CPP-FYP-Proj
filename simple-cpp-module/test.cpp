#include "catch2.hpp"
#define CATCH_CONFIG_MAIN // This tells Catch to provide a main() - only do this in one cpp file

#include "car.cpp"

SCENARIO("Tutorial 1: Creating a car object"){
    GIVEN("No prexisting conditions"){
        THEN("A car object should be present"){
            Car car(2);
            REQUIRE(car.acceleration == 2);
        }
        THEN("failing test case"){
            Car car();
            REQUIRE(car);
        }
    }
}
