---
title: "Perspective Wand : Experiencing Superluminal in VR"
date: 2021-01-12T00:00:00+42:00
description: Hello, World! of course my first post would have this title. 😛
menu:
  sidebar:
    name: Perspective Wand
    identifier: perspective-wand
    parent: projects
    weight: 10
hero: images/forest.jpg
tags: ["fuck-yeah", "unity", "VR", "monthly-project"]
categories: ["Projects"]
---

<div>
    <img style="width:100%" src="/imgs/perspective-wand-000.gif" alt="perspective wand example">
</div>

# Have you heard of Superluminal?

If not, check it out!  
I really enjoyed playing it : [link to Superluminal on Steam](https://store.steampowered.com/app/1049410/Superliminal/)  

The puzzles are incredible.  
It has this game mechanic that tricks your mind. Even when you understand it, it still leaves you in awe.  

If you know me, you know where this is going...  
I wondered how would it feel to interact with this game mechanic in the real world.  
I am really into VR and that is probably the only environment (for now) that we could experience this game mechanic.  
  
It also got me thinking...  
Is it even possible to do this in VR?  

I did some research and found this gold gem on youtube:
- [How do non-euclidean games work? | Bitwise](https://www.youtube.com/watch?v=lFEIUcXCEvI)

The video talks about what non-euclidian games are (super freaking cool is what they are).  
Fast forward to [10:46 in the video](https://youtu.be/lFEIUcXCEvI?t=646) and it explains how the game mechanic in Superluminal works.  
  
I gotta say...  
... I was a ***Bit Wiser*** after watching that video!  
![ba dum tss](/imgs/memes/ba-dum-tss.png)

# How does the game mechanic work?
The video puts it really well **"as you pick up an object, its perspective stays the same, but its real size changes dramatically."**  
Meaning, something small that you pick up on a table, becomes really big if you point it at some place far away.  
There are all sorts of interesting puzzles that you can make with that.  

The logic behind this mechanic is super simple:  
  
1. When you pick up the object, you store
   - the current distance from the player to the object and
   -  also the current scale value of the object.  
2. As you move the object in the world, push it as far as you can. 
3. With that object in that position, 
   - get that distance and initial distance stored.
   - this gives you a ratio that you can use to calculate the scale that the object should have in this new distance.  

My mind was blown. 🤯  
It makes so much sense AND it is so clever.

# How did I go about building this in VR?
I am familiar with making VR things in Unity, so that was an easy choice for me.  
  
Next, I decided to 
- first make the mechanic work in a regular 2D screen
- and then tackle how it work work in VR

I am sure there would be more to it then the simple math.  
It turns out that the hardest part, to me, was figuring out where to place the object.

Here are some of the ways I tried doing that...

## Attempt #1: Push the object backwards a little bit every frame
That initially worked well.  
However, but once my object was far away and I looked at something that was close, when my object was already passed it.  
  
I added a Raycast to check if whatever I was pointing at was closer to where the object currently was.  
That didn't solve the problem entirely. The Raycast is a very thin line so the object I was holding would stay behind another object until I actually aimed into an object that was closer.  

So I tried something else.

## Attempt #2: At every frame, calculate farthest position starting from the closest position

This actually worked out very well.  
There are probably other solutions that are more efficient.  
I actually spent a couple of hours over the weekend trying different ways, but I took a little break and remembered what my goal was:
- **Goal:** to experience this in VR.
- **Not A Goal:** to make the most efficient mechanic in the world.

## Calculating the farthest the object can be
This is actually an interesting problem.  

How do we know we can place an object at a certain position?
Unity does not give us a way to do a collision check on demand given a collider (if it does, let me know!).  

So to do that check, I used ["Unity's Physics Check Box collision"](https://docs.unity3d.com/ScriptReference/Physics.CheckBox.html)  
To define the box size, I used an approximation.
I scaled the box size to what the object's scale would be at a certain point.   
It is not perfect, but it works with most shapes.  

### How else could we do this?
There are many other ways.  
I think one of the best solutions would be for each object to have a component that calculates how far it can be pushed back given an initial position and direction.  
  
In that way, simple objects can use something like I mentioned above. Complex objects can implement something that checks for collisions using different shapes and sizes. (for example, an object with holes in it, like a donut.)
  
The mathematician in me also likes the other possibility to figure out a set of boxes which can fill an object's space.  
That could be using in some preprocessing function or in realtime.  
During the "push back operation", we check if any of the boxes are collisind with anything else.
  
Again, this was a weekend project. So I brought myself to focus on the task.  
(As I write this, I have this itch to go back and give these other options a try...)

# Experiencing it in VR

So there are a few things to think about.  
- How do we pick up an object?
- Which direction do we push it away?

## How to pick up the object?
There were two ways I thought about:
1. Pick up the object by grabbing it.
2. Use a pointer (or some cool "perspective wand") to point to select an object.

Grabing the object would be really cool, because it would give you the extra idea that "I can't be placing this really far away, it is right here in my hands".  
However, I would have to change how the mechanic work to actually just place the object far away, when I actually let go of the object, which meant changing my current implementation. So I decided to maybe try that later. (I haven't yet)

So I went with option two. Simple click pointer.

## Which direction do we push it away?
We want the object to scale in relation to the position of our eyes,
but we want to use our hands to place the object in different locations.

So then, the direction to push the object becomes:
- from: the middle point in between the player's eyes
- to: the location where the hand is pointing to (raycast from the hand's/wand's forward position to whatever we hit)

Which is very similar to the 2D screen effect.  
Except that in that frame of view, we are always pointing at the center of the camera and the camera is always moving to where we are pointing.

and that is it!  
It does work in VR!

# How did it feel to use this "perspective wand" in VR?
It feels like doing magic!
I threw together a bunch of assets in a scene and went crazy with moving them around.  
I tricked myself many times.  
I sometimes still get tricked when I place something in the sky without realizing.  
When that happens, the object starts to fall very slowing and that is what makes me realize that the object is really far away and also veeery large.

# Where can I try it?
I am hosting a WebGL (non-vr) version that you can give a try here:
- https://unfolding-dragon.github.io/perspective-wand/

I also built for a couple of other devices:
- https://github.com/unfolding-dragon/perspective-wand/releases/tag/v0.1
