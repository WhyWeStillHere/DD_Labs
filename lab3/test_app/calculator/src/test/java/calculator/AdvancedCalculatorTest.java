package calculator;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AdvancedCalculatorTest {
  @Test
  public void multTestZero() {
    assertEquals(0, AdvancedCalculator.mult(5, 0));
    assertEquals(0, AdvancedCalculator.mult(0, 5));
    assertEquals(0, AdvancedCalculator.mult(0, 0));
  }

  @Test
  public void multTestSimpleTest() {
    assertEquals(2.5, AdvancedCalculator.mult(5, 0.5));
    assertEquals(4, AdvancedCalculator.mult(2, 2));
    assertEquals(-10, AdvancedCalculator.mult(2, -5));
    assertEquals(-10, AdvancedCalculator.mult(-2.5, 4));
    assertEquals(100, AdvancedCalculator.mult(-10, -10));
  }
}
