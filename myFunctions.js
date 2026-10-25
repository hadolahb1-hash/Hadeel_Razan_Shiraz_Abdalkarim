$(document).ready(function () {
    $(".details-row").hide();
    $("#formBox").hide();
    $("#resultBox").hide();

    $(".toggle-details").click(function () {
        var id = $(this).attr("data-target");
        if ($(this).is(":checked")) {
            $("#" + id).parent().parent().show();
        } else {
            $("#" + id).parent().parent().hide();
        }
    });

    $("#continueBtn").click(function () {
        if ($("input[name='carSelect']:checked").length == 0) {
            alert("الرجاء اختيار سيارة واحدة على الأقل");
            return;
        }
        $("#formBox").slideDown();
        $("html, body").animate({ scrollTop: $("#formBox").offset().top }, 500);
    });

    $("#rentalForm").submit(function (e) {
        e.preventDefault();
        validateForm();
    });
});

function parseDate(str) {
    var parts = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (parts == null) {
        return null;
    }
    var y = parseInt(parts[1], 10);
    var m = parseInt(parts[2], 10);
    var d = parseInt(parts[3], 10);
    var date = new Date(y, m - 1, d);
    if (date.getFullYear() != y || date.getMonth() != m - 1 || date.getDate() != d) {
        return null;
    }
    return date;
}

function formatDate(date) {
    var d = ("0" + date.getDate()).slice(-2);
    var m = ("0" + (date.getMonth() + 1)).slice(-2);
    return d + "-" + m + "-" + date.getFullYear();
}

function validateForm() {
    var errors = [];

    var fullName = $("#fullName").val().trim();
    var nationalId = $("#nationalId").val().trim();
    var startStr = $("#startDate").val().trim();
    var endStr = $("#endDate").val().trim();
    var mobile = $("#mobile").val().trim();
    var email = $("#email").val().trim();

    if (fullName != "") {
        if (!/^[\u0621-\u064A\s]+$/.test(fullName)) {
            errors.push("الاسم يجب أن يحتوي أحرف عربية فقط");
        }
    }

    if (nationalId == "") {
        errors.push("الرقم الوطني إلزامي");
    } else if (!/^\d{11}$/.test(nationalId)) {
        errors.push("الرقم الوطني يجب أن يتكون من 11 رقم");
    } else {
        var province = parseInt(nationalId.substring(0, 2), 10);
        if (province < 1 || province > 14) {
            errors.push("أول خانتين من الرقم الوطني يجب أن تكون بين 01 و 14");
        }
    }

    var startDate = null;
    var endDate = null;

    if (startStr == "") {
        errors.push("تاريخ البداية إلزامي");
    } else {
        startDate = parseDate(startStr);
        if (startDate == null) {
            errors.push("تاريخ البداية غير صالح");
        }
    }

    if (endStr == "") {
        errors.push("تاريخ النهاية إلزامي");
    } else {
        endDate = parseDate(endStr);
        if (endDate == null) {
            errors.push("تاريخ النهاية غير صالح");
        }
    }

    if (startDate != null && endDate != null) {
        if (endDate <= startDate) {
            errors.push("تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية");
        }
    }

    if (mobile != "") {
        if (!/^(093|098|099|094|095|096)\d{7}$/.test(mobile)) {
            errors.push("رقم الموبايل غير مطابق لشبكة سيريتل أو MTN");
        }
    }

    if (email != "") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push("البريد الإلكتروني غير صحيح");
        }
    }

    if (errors.length > 0) {
        var msg = "";
        for (var i = 0; i < errors.length; i++) {
            msg = msg + errors[i] + "\n";
        }
        alert(msg);
        return false;
    }

    var days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    var total = 0;
    var html = "<h3>تفاصيل الحجز</h3><ul>";
    var text = "تفاصيل الحجز\n";

    $("input[name='carSelect']:checked").each(function () {
        var row = $(this).parent().parent();
        var model = row.find("td").eq(1).text();
        var priceText = row.find("td").eq(3).text().replace(/[^0-9]/g, "");
        var price = parseInt(priceText, 10);
        var carTotal = price * days;
        total = total + carTotal;
        html = html + "<li>" + model + " - عدد الأيام: " + days + " - الكلفة: " + carTotal.toLocaleString() + " ل.س</li>";
        text = text + model + " - عدد الأيام: " + days + " - الكلفة: " + carTotal.toLocaleString() + " ل.س\n";
    });

    html = html + "</ul>";
    html = html + "<p>من: " + formatDate(startDate) + " إلى: " + formatDate(endDate) + "</p>";
    text = text + "من: " + formatDate(startDate) + " إلى: " + formatDate(endDate) + "\n";

    if (days > 7) {
        html = html + "<p>المبلغ قبل الخصم: " + total.toLocaleString() + " ل.س</p>";
        text = text + "المبلغ قبل الخصم: " + total.toLocaleString() + " ل.س\n";
        total = total * 0.9;
        html = html + "<p>تم تطبيق خصم 10%</p>";
        text = text + "تم تطبيق خصم 10%\n";
    }

    html = html + "<p><strong>المبلغ الإجمالي: " + total.toLocaleString() + " ل.س</strong></p>";
    text = text + "المبلغ الإجمالي: " + total.toLocaleString() + " ل.س";

    $("#resultContent").html(html);
    $("#resultBox").hide().fadeIn();
    $("html, body").animate({ scrollTop: $("#resultBox").offset().top }, 500);
    alert(text);

    return false;
}