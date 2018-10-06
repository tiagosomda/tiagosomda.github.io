$(document).ready(function () {
    console.log("web is loaded - projects.js")
    populatePage();
});

var tagList = undefined;
populatePage = function () 
{
    getProjects().then(function(projects) {
        console.log("project list retrieved");
        var template = $('#ProjectItemTemplate').clone();
        template.removeAttr('id');

        tagList = new Object();
        $.each(projects, function (index, project) {
            var item = createProjectItem(template, project);
            $('.project-list').append(item);
        });

        initializeShuffle();
    }); 
}


getProjects = function () {
    var defer = $.Deferred();
    var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQqN2SHJ6H0hjTz9V3MP_IhQdpz6fuDyWVz-ZHZTdBBP6X2Z-vFo1dtGlY00unCC_eDrvpcmF8xInYz/pub?gid=0&single=true&output=tsv';
    $.get(url, function (tsvData) {
        var projects = $.tsv.toObjects(tsvData);
        defer.resolve(projects);
    });

    return defer;

}


createProjectItem = function(template, project) {
    var item = template.clone();

    item.find('.project-title').text(project.title);
    item.find('.project-img').attr('src', project.imageUrl);
    item.find('.image-link').attr('href', project.imageUrl);
    item.find('.project-link').attr('href', project.projectUrl);
    
    var tags = '';
    $.each(project.tags.split(","), function (index, tag) {
        tag = tag.trim();
        var key = tag.toLowerCase();
        
        tags += ' ,"'+key+'"';
        
        if(key !== 'featured' && tagList[key] == undefined)
            tagList[key] = tag;
    });
    item.attr('data-groups', '["all" ' + tags + ']');

    return item;
}

initializeShuffle = function()
{
    var tagFilter = $('#filter');

    tagFilter.append('<li><a data-group="all">All</a></li>');
    tagFilter.append('<li><a class="active" data-group="featured">Featured</a></li>');
    for(var key in tagList) 
    {
        tagFilter.append('<li><a data-group="'+key+'">'+tagList[key]+'</a></li>');
    }

    // -------------------------------------------------------------
    // Shuffle
    // -------------------------------------------------------------

    var $grid = $('#grid');

    $grid.shuffle({
        itemSelector: '.portfolio-item'
    });

    /* reshuffle when user clicks a filter item */
    $('#filter a').click(function (e) {
        e.preventDefault();

        // set active class
        $('#filter a').removeClass('active');
        $(this).addClass('active');

        // get group name from clicked item
        var groupName = $(this).attr('data-group');

        // reshuffle grid
        $grid.shuffle('shuffle', groupName );
    });

    $grid.shuffle('shuffle', 'featured');
}