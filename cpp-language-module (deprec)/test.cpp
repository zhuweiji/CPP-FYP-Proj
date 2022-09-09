#define CATCH_CONFIG_MAIN // This tells Catch to provide a main() - only do this in one cpp file
#include "catch2.h"
#include "car.cpp"

unsigned int Factorial(unsigned int number)
{
    return number <= 1 ? number : Factorial(number - 1) * number;
}



TEST_CASE("Driving my car")
{
    // REQUIRE(Factorial(1) == 1);
    // REQUIRE(Factorial(2) == 2);
    // REQUIRE(Factorial(3) == 6);
    // REQUIRE(Factorial(10) == 3628800);
    
    SECTION("Car drive"){
        Car mycar = Car();
        mycar.drive();
        REQUIRE(mycar.acceleration == 1);
    }
}