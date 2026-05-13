package com.example.lucky;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lucky")
public class LuckyController {

    @GetMapping("/list")
    public Object list() { return null; }

    @PostMapping("/addActivity")
    public Object addActivity(@RequestBody Object body) { return null; }

    @RequestMapping("/getManagerResource")
    public Object getManagerResource() { return null; }
}
