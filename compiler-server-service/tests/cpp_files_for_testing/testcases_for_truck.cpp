#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest.h"
#include "truck_for_test.cpp" 

TEST_CASE("Truck class can be created and used in code"){
    GIVEN("No starting preconditions"){
        THEN("A truck can be created"){
            Truck mytruck(2);
            REQUIRE(mytruck.acceleration == 3);
        }
    }
}